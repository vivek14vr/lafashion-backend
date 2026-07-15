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
      'Images are auto-resized (max 1920px) and compressed to JPEG before Cloudinary. Prefer files under ~15MB for faster uploads on Render.',
    defaultColumns: ['filename', 'filesize', 'updatedAt'],
  },
  fields: [],
  upload: {
    mimeTypes: ['image/*'],
    bulkUpload: true,
    displayPreview: true,
    // Sharp once per file before Cloudinary (keep quality/size modest for Render CPU)
    resizeOptions: {
      width: 1920,
      height: 1920,
      fit: 'inside',
      withoutEnlargement: true,
    },
    formatOptions: {
      format: 'jpeg',
      options: {
        quality: 78,
        mozjpeg: true,
      },
    },
  },
}
