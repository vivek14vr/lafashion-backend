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
import { HomeDestinations } from './globals/HomeDestinations'
import { cloudinaryAdapter, isCloudinaryEnabled } from './storage/cloudinary'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Public site origin — admin is proxied here at /admin
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000'
// Prefer the public origin so login/admin links stay on the website
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || frontendURL
const backendURL = process.env.PAYLOAD_BACKEND_URL || 'http://localhost:3001'

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · LA Fashion Closet',
    },
  },
  collections: [Users, Media, Events, Galleries],
  globals: [HomeDestinations],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  cors: [frontendURL, serverURL, backendURL],
  csrf: [frontendURL, serverURL],
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