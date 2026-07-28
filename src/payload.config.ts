import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Events } from './collections/Events'
import { Galleries } from './collections/Galleries'
import { Registrations } from './collections/Registrations'
import { HomeDestinations } from './globals/HomeDestinations'
import { cloudinaryAdapter, isCloudinaryEnabled } from './storage/cloudinary'

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
  collections: [Users, Media, Events, Galleries, Registrations],
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
    cloudStoragePlugin({
      enabled: isCloudinaryEnabled(),
      collections: {
        media: {
          adapter: cloudinaryAdapter({
            folder: process.env.CLOUDINARY_FOLDER || 'la-fashion-closet',
          }),
          // Serve files from Cloudinary CDN URLs (not /api/media/file/...)
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
        },
      },
    }),
  ],
})

if (isCloudinaryEnabled()) {
  console.info(
    `[payload] Cloudinary enabled → folder "${process.env.CLOUDINARY_FOLDER || 'la-fashion-closet'}"`,
  )
} else {
  console.info(
    '[payload] Cloudinary not configured — media saved under backend/media. Set CLOUDINARY_* in backend/.env to enable.',
  )
}