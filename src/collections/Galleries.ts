import type { CollectionConfig } from 'payload'

function slugify(title: unknown): string {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function firstImageId(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null
  const first = images[0]
  if (typeof first === 'string') return first
  if (first && typeof first === 'object' && 'id' in first) {
    return String((first as { id: string }).id)
  }
  return null
}

export const Galleries: CollectionConfig = {
  slug: 'galleries',
  labels: {
    singular: 'Gallery',
    plural: 'Galleries (photo archives)',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'date', 'published', 'coverImage'],
    group: 'Website',
    description:
      'Photo archives for past shows — powers “Our gallery” on the homepage and the Galleries page. Link to a platform event, or create a standalone gallery.',
  },
  defaultPopulate: {
    coverImage: true,
    images: true,
    title: true,
    date: true,
    location: true,
    published: true,
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        published: {
          equals: true,
        },
      }
    },
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (data.title) {
          data.slug = slugify(data.title)
        }
        if (!data.slug) {
          data.slug = `gallery-${Date.now().toString(36)}`
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (!data) return data
        if (data.title) {
          data.slug = slugify(data.title)
        }
        if (!data.slug) {
          data.slug = originalDoc?.slug || `gallery-${Date.now().toString(36)}`
        }
        if (!data.coverImage) {
          const first = firstImageId(data.images)
          if (first) data.coverImage = first
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          description: 'How this gallery is labeled and linked on the site.',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Gallery title',
              admin: {
                description: 'Show or gallery name (e.g. Milan Fashion Week 2025).',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'source',
                  type: 'select',
                  defaultValue: 'standalone',
                  label: 'Gallery type',
                  options: [
                    { label: 'Standalone past show (not on platform)', value: 'standalone' },
                    { label: 'Linked to a platform event', value: 'platform' },
                  ],
                  admin: {
                    width: '50%',
                    description: 'Standalone for past shows never listed on this site.',
                  },
                },
                {
                  name: 'event',
                  type: 'relationship',
                  relationTo: 'events',
                  label: 'Linked event',
                  admin: {
                    width: '50%',
                    condition: (_, siblingData) => siblingData?.source === 'platform',
                    description: 'Only when this gallery belongs to a platform event.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'date',
                  type: 'date',
                  label: 'Show month',
                  admin: {
                    width: '50%',
                    date: {
                      pickerAppearance: 'monthOnly',
                      displayFormat: 'MMMM yyyy',
                    },
                    description: 'Month the show happened (day not required).',
                  },
                },
                {
                  name: 'location',
                  type: 'text',
                  label: 'Location',
                  admin: {
                    width: '50%',
                    description: 'City or venue when not linked to a platform event.',
                  },
                },
              ],
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Short blurb',
              admin: {
                description: 'Shown on the gallery page under the title.',
              },
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Cover / banner image',
              admin: {
                description:
                  'Shown on gallery cards and the homepage. Leave empty to use the first photo from the Photos tab.',
              },
            },
          ],
        },
        {
          label: 'Photos',
          description: 'Images visitors browse in the gallery.',
          fields: [
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              required: true,
              label: 'Gallery photos',
              admin: {
                isSortable: true,
                description:
                  'Create New or drag & drop to add photos. Drag to reorder how they appear on the site.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            const fromTitle = slugify(siblingData?.title)
            return fromTitle || value || undefined
          },
        ],
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      label: 'Published',
      admin: {
        position: 'sidebar',
        description: 'When checked, this gallery is visible on the public website.',
      },
    },
  ],
}
