import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media file',
    plural: 'Media library',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: 'filename',
    group: 'Assets',
    description:
      'Shared image library used by events, galleries, and homepage city snaps. Uploads go to private Amazon S3 storage.',
    defaultColumns: ['filename', 'filesize', 'updatedAt'],
    pagination: {
      defaultLimit: 24,
      limits: [24, 48, 96],
    },
  },
  fields: [],
  upload: {
    mimeTypes: ['image/*'],
    bulkUpload: true,
    displayPreview: true,
    // S3 stores the source file privately; Payload serves authorized downloads
    // with signed URLs.
  },
}
