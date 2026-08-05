import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Events } from './collections/Events'
import { Galleries } from './collections/Galleries'
import { Registrations } from './collections/Registrations'
import { CommunityRegistrations } from './collections/CommunityRegistrations'
import { DesignerRegistrations } from './collections/DesignerRegistrations'
import { HomeDestinations } from './globals/HomeDestinations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Public website origin
const frontendURL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')
// Where the admin UI is served (frontend proxy origin in local; may be backend URL in prod)
const serverURL = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.FRONTEND_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')
const backendURL = (process.env.PAYLOAD_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '')

const trustedOrigins = Array.from(new Set([frontendURL, serverURL, backendURL].filter(Boolean)))
const isS3Enabled = Boolean(process.env.S3_BUCKET?.trim() && process.env.S3_REGION?.trim())

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    theme: 'dark',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · LA Fashion Closet',
    },
    components: {
      beforeDashboard: ['/components/AdminDashboardGuide'],
      graphics: {
        Logo: '/components/AdminLogo',
        Icon: '/components/AdminIcon',
      },
    },
  },
  collections: [
    Users,
    Media,
    Events,
    Galleries,
    Registrations,
    CommunityRegistrations,
    DesignerRegistrations,
  ],
  globals: [HomeDestinations],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  cors: trustedOrigins,
  csrf: trustedOrigins,
  sharp,
  plugins: [
    s3Storage({
      enabled: isS3Enabled,
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: process.env.S3_REGION || 'us-east-2',
      },
      signedDownloads: true,
      collections: {
        media: {
          prefix: process.env.S3_PREFIX || 'lafashioncloset',
        },
      },
    }),
  ],
})

console.info(
  isS3Enabled
    ? `[payload] S3 storage enabled → bucket "${process.env.S3_BUCKET}"`
    : '[payload] S3 storage disabled — set S3_BUCKET and S3_REGION to enable media storage.',
)
