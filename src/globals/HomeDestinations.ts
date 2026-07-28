import type { GlobalConfig } from 'payload'

/** Home page destination cards under Fashion Beyond Borders banner */
export const HomeDestinations: GlobalConfig = {
  slug: 'home-destinations',
  label: 'Homepage city snaps',
  admin: {
    group: 'Website',
    description:
      'Rotating photos for the five city cards on the homepage (New Delhi, Los Angeles, Mauritius, Paris, Cannes). Upload several photos per city.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'destinations',
      type: 'array',
      labels: {
        singular: 'City card',
        plural: 'City cards',
      },
      minRows: 1,
      maxRows: 8,
      admin: {
        initCollapsed: true,
        description: 'Drag to reorder cards on the homepage. Expand one city at a time to upload photos.',
      },
      defaultValue: [
        { city: 'New Delhi' },
        { city: 'Los Angeles' },
        { city: 'Mauritius' },
        { city: 'Paris' },
        { city: 'Cannes' },
      ],
      fields: [
        {
          name: 'city',
          type: 'text',
          required: true,
          label: 'City name',
          admin: {
            description: 'Label shown on the homepage card.',
          },
        },
        {
          name: 'images',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          label: 'Rotating photos',
          admin: {
            isSortable: true,
            description: 'Create New or drag & drop — photos rotate on this city’s homepage card.',
          },
        },
      ],
    },
  ],
}
