import type { GlobalConfig } from 'payload'

export const MediaFolders: GlobalConfig = {
  slug: 'media-folders',
  label: 'Media folders',
  access: {
    // Folder names are only organizational labels; allowing reads avoids the
    // admin filter racing the client-side session refresh on page load.
    read: () => true,
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
