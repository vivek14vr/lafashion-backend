'use client'

import React from 'react'
import { Button, useTranslation } from '@payloadcms/ui'
import { usePublishEventAndReturn } from './usePublishEventAndReturn'

/** Replaces the default Publish button — publishes then returns to the events list */
export default function EventPublishButton() {
  const { t } = useTranslation()
  const { canPublish, publishAndReturn, publishing } = usePublishEventAndReturn()

  if (!canPublish && !publishing) {
    return null
  }

  return (
    <Button
      buttonStyle="primary"
      disabled={!canPublish || publishing}
      onClick={() => void publishAndReturn()}
      size="medium"
      type="button"
    >
      {publishing ? 'Publishing…' : t('version:publishChanges')}
    </Button>
  )
}
