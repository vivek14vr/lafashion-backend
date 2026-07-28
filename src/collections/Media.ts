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
      'Shared image library used by events, galleries, and homepage city snaps. Uploads go to Cloudinary (prefer files under 10MB).',
    defaultColumns: ['filename', 'filesize', 'updatedAt'],
    pagination: {
      defaultLimit: 24,
      limits: [24, 48, 96],
    },
    components: {
      beforeListTable: ['/components/MediaGrid'],
    },
  },
  fields: [],
  upload: {
    mimeTypes: ['image/*'],
    bulkUpload: true,
    displayPreview: true,
    // Avoid Sharp resize/format here — free Render (512MB) OOMs on large runway photos.
    // Compression is applied via Cloudinary upload transformations instead.
  },
}
