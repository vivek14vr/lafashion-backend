import { getPayload } from 'payload'

import config from '../payload.config'

const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.SEED_ADMIN_PASSWORD

if (!email || !password) {
  throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must both be set.')
}

if (password.length < 12) {
  throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters long.')
}

const payload = await getPayload({ config })

try {
  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const existingUser = existingUsers.docs[0]

  if (existingUser) {
    await payload.update({
      collection: 'users',
      id: existingUser.id,
      data: { password },
      overrideAccess: true,
    })
    payload.logger.info(`Updated admin credentials for ${email}.`)
  } else {
    await payload.create({
      collection: 'users',
      data: { email, password },
      overrideAccess: true,
    })
    payload.logger.info(`Created admin credentials for ${email}.`)
  }
} finally {
  await payload.destroy()
}
