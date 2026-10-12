import type { CollectionConfig } from 'payload'

function authCookieSecure(): boolean {
  if (process.env.AUTH_COOKIE_SECURE === 'true') return true
  if (process.env.AUTH_COOKIE_SECURE === 'false') return false
  return (process.env.FRONTEND_URL || '').startsWith('https://')
}

function authCookieDomain(): string | undefined {
  const configured = process.env.AUTH_COOKIE_DOMAIN?.trim()
  if (configured) return configured

  try {
    const hostname = new URL(process.env.FRONTEND_URL || '').hostname
    return hostname === 'lafashioncloset.com' || hostname.endsWith('.lafashioncloset.com')
      ? '.lafashioncloset.com'
      : undefined
  } catch {
    return undefined
  }
}

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
      domain: authCookieDomain(),
      sameSite: 'Lax',
      secure: authCookieSecure(),
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
