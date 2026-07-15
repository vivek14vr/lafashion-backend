import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: 'filename',
    description:
      'Bulk upload photos here, then attach them on a Gallery under Images.',
    defaultColumns: ['filename', 'updatedAt'],
  },
  fields: [],
  upload: {
    mimeTypes: ['image/*'],
    bulkUpload: true,
    displayPreview: true,
  },
}
