import type { CollectionConfig } from 'payload'

function slugify(title: unknown): string {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** e.g. 2026-08-01-1830 — keeps slugs unique when titles repeat */
function dateStamp(date: unknown): string {
  const d = new Date(String(date || ''))
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}-${h}${min}`
}

function eventSlug(title: unknown, date: unknown, fallback?: string | null): string {
  const base = slugify(title)
  const stamp = dateStamp(date)
  if (base && stamp) return `${base}-${stamp}`
  if (base) return base
  if (stamp) return `event-${stamp}`
  return fallback || `event-${Date.now().toString(36)}`
}

function statusFromDate(date: unknown): 'upcoming' | 'past' {
  if (!date) return 'upcoming'
  const eventTime = new Date(String(date)).getTime()
  if (Number.isNaN(eventTime)) return 'upcoming'
  return eventTime >= Date.now() ? 'upcoming' : 'past'
}

const onStep =
  (step: number) =>
  (_data: unknown, siblingData: { createStep?: number | null }) =>
    (siblingData?.createStep ?? 1) === step

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Event',
    plural: 'Events (nights & tickets)',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'status', '_status', 'portraitImage'],
    group: 'Website',
    description:
      'Runway nights shown on Upcoming nights and the Events page. Edits autosave as drafts — Publish returns you to the events list.',
  },
  defaultPopulate: {
    portraitImage: true,
    bannerImage: true,
    title: true,
    date: true,
    venue: true,
    status: true,
  },
  versions: {
    drafts: {
      autosave: {
        interval: 1500,
      },
    },
    maxPerDoc: 25,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data
        const title = data.title ?? originalDoc?.title
        const date = data.date ?? originalDoc?.date
        if (title || date) {
          data.slug = eventSlug(title, date, originalDoc?.slug)
        }
        if (!data.slug) {
          data.slug = originalDoc?.slug || `event-${Date.now().toString(36)}`
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (!data) return data
        const title = data.title ?? originalDoc?.title
        const date = data.date ?? originalDoc?.date
        data.slug = eventSlug(title, date, originalDoc?.slug)
        data.status = statusFromDate(date)

        const legacyCover = data.coverImage ?? originalDoc?.coverImage
        if (legacyCover) {
          if (!data.portraitImage) data.portraitImage = legacyCover
          if (!data.bannerImage) data.bannerImage = legacyCover
        }

        return data
      },
    ],
    afterRead: [
      async ({ doc, req, context }) => {
        if (!req.user) {
          delete doc.createStep
        } else if (doc.createStep == null) {
          doc.createStep = 1
        }

        if (!doc?.date || context?.skipStatusSync) return doc

        const nextStatus = statusFromDate(doc.date)
        if (doc.status === nextStatus) return doc

        doc.status = nextStatus

        if (doc.id) {
          void req.payload
            .update({
              collection: 'events',
              id: doc.id,
              data: { status: nextStatus },
              overrideAccess: true,
              context: { skipStatusSync: true },
              draft: true,
            })
            .catch(() => {
              // Ignore sync failures on read
            })
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'createStep',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 3,
      label: false,
      admin: { disableListColumn: true },
    },
    // Step 1 — Basics
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Event title',
      admin: {
        condition: onStep(1),
        description: 'Name visitors see on cards and the event detail page.',
      },
    },
    {
      type: 'row',
      admin: {
        condition: onStep(1),
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          label: 'Date & time',
          admin: {
            width: '50%',
            date: {
              pickerAppearance: 'dayAndTime',
            },
            description: 'Also sets Upcoming vs Past automatically.',
          },
        },
        {
          name: 'venue',
          type: 'text',
          required: true,
          label: 'Venue',
          admin: {
            width: '50%',
            description: 'City, club, or location shown under the title.',
          },
        },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      label: 'Summary',
      admin: {
        condition: onStep(1),
        description: 'Shown on event cards and the event detail page.',
      },
    },
    // Step 2 — Images
    {
      type: 'row',
      admin: {
        condition: onStep(2),
      },
      fields: [
        {
          name: 'portraitImage',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Portrait image',
          admin: {
            width: '50%',
            description: 'Tall image for event cards and listings.',
          },
        },
        {
          name: 'bannerImage',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Banner image',
          admin: {
            width: '50%',
            description: 'Wide hero for the event detail page.',
          },
        },
      ],
    },
    // Step 3 — Tickets
    {
      name: 'ticketUrl',
      type: 'text',
      label: 'Ticket booking URL',
      admin: {
        condition: onStep(3),
        description:
          'External link for “Book tickets”. Leave empty to hide the button. Use Publish & finish to go live and return to the events list.',
      },
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
      // Not `required` — client validation runs before hooks, and the field is hidden.
      // beforeValidate / beforeChange always generate it from title + date.
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            const next = eventSlug(siblingData?.title, siblingData?.date, value)
            return next || value || undefined
          },
        ],
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
        hidden: true,
        readOnly: true,
      },
    },
  ],
}
