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
      'Uploads go to Cloudinary (resized there, not on this server). Prefer files under 10MB for the free Cloudinary plan.',
    defaultColumns: ['filename', 'filesize', 'updatedAt'],
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
