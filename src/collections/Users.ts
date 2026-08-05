import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Admin user',
    plural: 'Admin users',
  },
  admin: {
    useAsTitle: 'email',
    group: 'Settings',
    description:
      'People who can sign in to this CMS. These accounts do not appear on the public website.',
  },
  auth: {
    // Same host (localhost / production domain) for site proxy + CMS
    cookies: {
      sameSite: 'Lax',
      // The current deployment is HTTP behind Nginx. Secure cookies are only
      // accepted by browsers over HTTPS, so derive this from the public URL.
      secure:
        process.env.NODE_ENV === 'production' &&
        (process.env.FRONTEND_URL || '').startsWith('https://'),
    },
  },
  fields: [
    // Auth adds email/password; redeclare email to clarify labels for editors
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: 'Email (login)',
      admin: {
        description: 'Used to sign in to the admin panel.',
      },
    },
  ],
}
