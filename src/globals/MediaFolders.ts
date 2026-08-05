import type { GlobalConfig } from 'payload'

export const MediaFolders: GlobalConfig = {
  slug: 'media-folders',
  label: 'Media folders',
  access: {
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'folders',
      type: 'array',
      labels: { singular: 'Folder', plural: 'Folders' },
      fields: [{ name: 'name', type: 'text', required: true }],
    },
  ],
}
