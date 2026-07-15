import type { CollectionConfig } from 'payload'

function slugify(title: unknown): string {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function statusFromDate(date: unknown): 'upcoming' | 'past' {
  if (!date) return 'upcoming'
  const eventTime = new Date(String(date)).getTime()
  if (Number.isNaN(eventTime)) return 'upcoming'
  return eventTime >= Date.now() ? 'upcoming' : 'past'
}

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'status', 'published'],
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
      ({ data, originalDoc }) => {
        if (!data) return data
        if (data.title) {
          data.slug = slugify(data.title)
        }
        data.status = statusFromDate(data.date)

        // Migrate legacy coverImage → portrait/banner when upgrading existing docs
        const legacyCover = data.coverImage ?? originalDoc?.coverImage
        if (legacyCover) {
          if (!data.portraitImage) data.portraitImage = legacyCover
          if (!data.bannerImage) data.bannerImage = legacyCover
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
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'venue',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'portraitImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Portrait image for event cards and listings.',
      },
    },
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Wide banner image for the event detail page hero.',
      },
    },
    {
      name: 'ticketUrl',
      type: 'text',
      admin: {
        description: 'External ticket booking URL',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'upcoming',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Past', value: 'past' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set automatically from the event date (future → Upcoming, past → Past).',
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
