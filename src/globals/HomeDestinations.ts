import type { GlobalConfig } from 'payload'

/** Home page destination cards under Fashion Beyond Borders banner */
export const HomeDestinations: GlobalConfig = {
  slug: 'home-destinations',
  label: 'Home destination cards',
  admin: {
    description:
      'Images for the five city cards on the homepage (New Delhi, Los Angeles, Mauritius, Paris, Cannes). Upload several photos per city — they rotate in the card carousel.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'destinations',
      type: 'array',
      labels: {
        singular: 'Destination',
        plural: 'Destinations',
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
        },
        {
          name: 'images',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          admin: {
            isSortable: true,
            description: 'Create New or drag & drop — photos appear on the home card for this city.',
          },
        },
      ],
    },
  ],
}
