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
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'date', 'published'],
    description:
      'Photo galleries for past shows — link to a platform event, or create a standalone gallery for shows not listed on the site.',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        published: {
          equals: true,
        },
      }
    },
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (data.title) {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (!data) return data
        if (data.title) {
          data.slug = slugify(data.title)
        }
        // Default cover to the first gallery image when empty
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
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Show or gallery name (e.g. Milan Fashion Week 2025).',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Generated automatically from the title.',
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'standalone',
      options: [
        { label: 'Standalone past show (not on platform)', value: 'standalone' },
        { label: 'Linked to a platform event', value: 'platform' },
      ],
      admin: {
        description: 'Choose standalone for past events that were never listed on this site.',
      },
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'platform',
        description: 'Optional — only when this gallery belongs to an event on the platform.',
      },
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'monthOnly',
          displayFormat: 'MMMM yyyy',
        },
        description: 'Month the show happened (day is not required).',
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'City or venue for shows not linked to a platform event.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short blurb shown on the gallery page.',
      },
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      admin: {
        isSortable: true,
        description:
          'Use Create New or drag & drop here to add gallery photos. They should appear as a list under this field after upload.',
      },
    },
    {
      name: 'coverImage',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        appearance: 'select',
        description: 'Optional — defaults to the first gallery image if left empty.',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
