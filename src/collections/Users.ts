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
    // Keep the JWT in an HttpOnly cookie and back it with a server-side
    // session so the frontend can safely renew it through Payload's
    // /api/users/refresh-token endpoint.
    useSessions: true,
    tokenExpiration: 60 * 60 * 24 * 30,
    // The site is served from both the apex and www hostnames. Share the
    // session across those two official hostnames so a login cannot vanish
    // during an apex/www redirect or navigation.
    cookies: {
      domain: process.env.NODE_ENV === 'production' ? '.lafashioncloset.com' : undefined,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
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
