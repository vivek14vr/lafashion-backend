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
      'Images are auto-resized (max 2560px) and compressed to JPEG ~80% before storage. Prefer files under ~25MB for smooth uploads.',
    defaultColumns: ['filename', 'filesize', 'updatedAt'],
  },
  fields: [],
  upload: {
    mimeTypes: ['image/*'],
    bulkUpload: true,
    displayPreview: true,
    // Sharp runs on the original before Cloudinary / local storage
    resizeOptions: {
      width: 2560,
      height: 2560,
      fit: 'inside',
      withoutEnlargement: true,
    },
    formatOptions: {
      format: 'jpeg',
      options: {
        quality: 80,
        mozjpeg: true,
      },
    },
  },
}
