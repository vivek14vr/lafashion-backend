import { APIError, type CollectionConfig, type PayloadRequest, type Where } from 'payload'

function slugify(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function validateExternalURL(value: unknown): true | string {
  if (!value) return true
  if (typeof value !== 'string') return 'Enter a valid URL.'
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return 'URL must use http or https.'
    return true
  } catch {
    return 'Enter a valid URL.'
  }
}

function mediaID(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) return String(value.id)
  return null
}

function isPrivateS3Media(value: unknown): boolean {
  if (!value || typeof value !== 'object' || !('url' in value)) return false
  const rawURL = String(value.url || '')
  if (rawURL.startsWith('/api/media/file/')) return true

  try {
    const url = new URL(rawURL)
    // Payload's protected file route is private regardless of whether the
    // serialized URL uses the backend, apex, www, or EC2 hostname.
    if (url.pathname.startsWith('/api/media/file/')) return true
    if (url.hostname.endsWith('.amazonaws.com')) return true
    if (!url.pathname.startsWith('/api/media/file/')) return false

    const trustedHosts = new Set(['localhost', '127.0.0.1'])
    for (const candidate of [
      process.env.FRONTEND_URL,
      process.env.PAYLOAD_BACKEND_URL,
      process.env.SERVER_API_URL,
      process.env.PUBLIC_API_URL,
    ]) {
      if (!candidate) continue
      try {
        trustedHosts.add(new URL(candidate).hostname)
      } catch {
        // Ignore malformed optional URLs and continue with safe defaults.
      }
    }

    return trustedHosts.has(url.hostname)
  } catch {
    return false
  }
}

async function assertPrivatePressMedia(data: Record<string, unknown>, req: PayloadRequest) {
  const ids = [mediaID(data.portraitImage), ...(Array.isArray(data.images) ? data.images.map(mediaID) : [])]
    .filter((id): id is string => Boolean(id))

  if (!ids.length) return

  const result = await req.payload.find({
    collection: 'media',
    where: { id: { in: ids } },
    depth: 0,
    limit: ids.length,
    pagination: false,
    overrideAccess: true,
  })
  const mediaByID = new Map(result.docs.map((media) => [String(media.id), media]))
  const invalid = ids.filter((id) => !isPrivateS3Media(mediaByID.get(id)))

  if (invalid.length) {
    throw new APIError(
      'Press releases may only use private AWS media. Replace the selected legacy image(s).',
      400,
      { mediaIDs: invalid },
      true,
    )
  }
}

async function uniqueSlug(base: string, currentID: unknown, req: PayloadRequest): Promise<string> {
  let candidate = base
  let suffix = 2

  while (true) {
    const result = await req.payload.find({
      collection: 'press-releases',
      where: { slug: { equals: candidate } },
      depth: 0,
      limit: 10,
      overrideAccess: true,
    })
    const collision = result.docs.some((doc) => String(doc.id) !== String(currentID || ''))
    if (!collision) return candidate
    candidate = `${base}-${suffix}`
    suffix += 1
  }
}

export const PressReleases: CollectionConfig = {
  slug: 'press-releases',
  labels: {
    singular: 'Press release',
    plural: 'Press releases',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'designerName', 'event', 'published', 'publishDate'],
    group: 'Website',
    description:
      'Publish editorial profiles for designers participating in LA Fashion Closet shows.',
  },
  defaultPopulate: {
    title: true,
    slug: true,
    designerName: true,
    brandName: true,
    excerpt: true,
    body: true,
    portraitImage: true,
    images: true,
    event: true,
    publishDate: true,
    featured: true,
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { headers, user } }) => {
      // Public site requests must never receive drafts/future releases, even
      // when the browser happens to carry an authenticated admin cookie.
      const isPublicSiteRead = headers.get('x-site-public-read') === 'true'
      if (user && !isPublicSiteRead) return true
      return {
        and: [
          { published: { equals: true } },
          { publishDate: { less_than_equal: new Date().toISOString() } },
        ] as Where[],
      }
    },
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, operation, req }) => {
        if (!data) return data

        if (operation === 'update' && originalDoc?.slug && !data.slug) {
          data.slug = originalDoc.slug
        } else {
          const base = slugify(data.slug || data.title || data.designerName) ||
            `press-release-${Date.now().toString(36)}`
          data.slug = await uniqueSlug(base, originalDoc?.id, req)
        }

        const mediaData = operation === 'update' && originalDoc
          ? { ...originalDoc, ...data }
          : data
        await assertPrivatePressMedia(mediaData, req)
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Story',
          fields: [
            { name: 'title', type: 'text', required: true, label: 'Headline' },
            { name: 'designerName', type: 'text', required: true, label: 'Designer name' },
            { name: 'brandName', type: 'text', label: 'Brand / label name' },
            {
              name: 'event',
              type: 'relationship',
              relationTo: 'events',
              label: 'Participating show',
              admin: { description: 'Connect this profile to the runway show.' },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              required: true,
              label: 'Short introduction',
              admin: { description: 'Used on press cards and social previews.' },
            },
            {
              name: 'body',
              type: 'richText',
              required: true,
              label: 'Designer write-up',
              admin: { description: 'Tell the designer’s story, collection, and show contribution.' },
            },
          ],
        },
        {
          label: 'Images',
          fields: [
            {
              name: 'portraitImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Designer portrait / hero image',
            },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Designer and collection photos',
              admin: { isSortable: true },
            },
          ],
        },
        {
          label: 'Links',
          fields: [
            { name: 'websiteUrl', type: 'text', label: 'Website URL', validate: validateExternalURL },
            { name: 'instagramUrl', type: 'text', label: 'Instagram URL', validate: validateExternalURL },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: 'publishDate',
      type: 'date',
      label: 'Publish date',
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured on press page',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Published',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
