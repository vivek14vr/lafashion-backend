'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useConfig, useDocumentInfo, useForm, useLocale } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import * as qs from 'qs-esm'

const EVENTS_LIST = '/admin/collections/events'

/** Publish the current event, then return to the events list */
export function usePublishEventAndReturn() {
  const router = useRouter()
  const { submit } = useForm()
  const { code: localeCode } = useLocale()
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const {
    id,
    collectionSlug,
    hasPublishPermission,
    setHasPublishedDoc,
    setMostRecentVersionIsAutosaved,
    setUnpublishedVersionCount,
    uploadStatus,
  } = useDocumentInfo()

  const [publishing, setPublishing] = useState(false)

  const publishAndReturn = useCallback(async () => {
    if (!hasPublishPermission || uploadStatus === 'uploading' || publishing) return false

    setPublishing(true)
    try {
      const params = qs.stringify(
        {
          depth: 0,
          locale: localeCode,
        },
        { addQueryPrefix: true },
      )

      const action = formatAdminURL({
        apiRoute: api,
        path: `/${collectionSlug || 'events'}${id ? `/${id}` : ''}${params}`,
      })

      const result = await submit({
        action,
        overrides: {
          _status: 'published',
        },
      })

      if (!result) return false

      setUnpublishedVersionCount?.(0)
      setMostRecentVersionIsAutosaved?.(false)
      setHasPublishedDoc?.(true)
      router.push(EVENTS_LIST)
      return true
    } finally {
      setPublishing(false)
    }
  }, [
    api,
    collectionSlug,
    hasPublishPermission,
    id,
    localeCode,
    publishing,
    router,
    setHasPublishedDoc,
    setMostRecentVersionIsAutosaved,
    setUnpublishedVersionCount,
    submit,
    uploadStatus,
  ])

  return {
    canPublish: Boolean(hasPublishPermission) && uploadStatus !== 'uploading',
    publishAndReturn,
    publishing,
  }
}
