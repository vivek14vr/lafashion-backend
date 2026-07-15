import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'
import { randomBytes } from 'crypto'

type CloudinaryAdapterArgs = {
  folder?: string
}

const configureClient = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET

  if (!cloud_name || !api_key || !api_secret) {
    return null
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  })

  return cloudinary
}

function sanitizeBaseName(filename: string): string {
  return (
    filename
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'image'
  )
}

function cloudinaryDeliveryUrl(publicId: string): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  if (!cloudName || !publicId) return ''
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`
}

export const cloudinaryAdapter =
  (args: CloudinaryAdapterArgs = {}): Adapter =>
  () => {
    const folder = args.folder || process.env.CLOUDINARY_FOLDER || 'la-fashion-closet'

    const adapter: GeneratedAdapter = {
      name: 'cloudinary',
      async handleUpload({ file, data }) {
        const client = configureClient()
        if (!client) {
          throw new Error('Cloudinary credentials are missing')
        }

        const baseName = sanitizeBaseName(file.filename)
        const unique = `${baseName}-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`
        const publicIdPath = path.posix.join(folder, unique)

        const upload = await new Promise<{
          public_id: string
          secure_url: string
          bytes: number
          width?: number
          height?: number
          format?: string
        }>((resolve, reject) => {
          const stream = client.uploader.upload_stream(
            {
              folder: path.posix.dirname(publicIdPath),
              public_id: path.posix.basename(publicIdPath),
              resource_type: 'image',
              overwrite: false,
              unique_filename: true,
            },
            (error, result) => {
              if (error || !result) {
                reject(error || new Error('Cloudinary upload failed'))
                return
              }
              resolve(result as {
                public_id: string
                secure_url: string
                bytes: number
                width?: number
                height?: number
                format?: string
              })
            },
          )

          stream.end(file.buffer)
        })

        const mimeType =
          upload.format === 'jpg' ? 'image/jpeg' : upload.format ? `image/${upload.format}` : data.mimeType

        const url = cloudinaryDeliveryUrl(upload.public_id) || upload.secure_url

        // Mutate for immediate response…
        data.filename = upload.public_id
        data.url = url
        data.filesize = upload.bytes
        if (upload.width) data.width = upload.width
        if (upload.height) data.height = upload.height
        if (mimeType) data.mimeType = mimeType

        // …and return so the plugin persists metadata (required by cloud-storage afterChange)
        return {
          filename: upload.public_id,
          url,
          filesize: upload.bytes,
          width: upload.width,
          height: upload.height,
          mimeType,
        }
      },
      async handleDelete({ filename }) {
        const client = configureClient()
        if (!client || !filename) return

        try {
          await client.uploader.destroy(filename, { resource_type: 'image' })
        } catch {
          // Ignore missing remote files
        }
      },
      generateURL({ filename }) {
        return cloudinaryDeliveryUrl(filename)
      },
      staticHandler() {
        return new Response('Not found', { status: 404 })
      },
    }

    return adapter
  }

export const isCloudinaryEnabled = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  )
