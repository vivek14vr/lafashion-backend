'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useConfig, useListQuery, useSelection } from '@payloadcms/ui'

type MediaRef = {
  id?: string | number
  url?: string | null
  thumbnailURL?: string | null
}

type EventDoc = {
  id: string | number
  title?: string | null
  date?: string | null
  venue?: string | null
  status?: 'upcoming' | 'past' | null
  _status?: 'draft' | 'published' | null
  portraitImage?: MediaRef | string | null
  bannerImage?: MediaRef | string | null
}

function mediaId(value: MediaRef | string | null | undefined): string | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value.id != null) return String(value.id)
  return null
}

function directSrc(value: MediaRef | string | null | undefined): string {
  if (!value || typeof value === 'string' || typeof value === 'number') return ''
  return value.thumbnailURL || value.url || ''
}

function formatEventDate(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Card grid replacing the default events table */
export default function EventsGrid() {
  const { data } = useListQuery()
  const { selected, setSelection } = useSelection()
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const [urlById, setUrlById] = useState<Record<string, string>>({})

  const docs = useMemo(() => (data?.docs ?? []) as EventDoc[], [data?.docs])

  const unresolvedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const doc of docs) {
      for (const field of [doc.portraitImage, doc.bannerImage]) {
        if (directSrc(field)) continue
        const id = mediaId(field)
        if (id && !urlById[id]) ids.add(id)
      }
    }
    return [...ids]
  }, [docs, urlById])

  useEffect(() => {
    if (!unresolvedIds.length) return

    let cancelled = false

    void (async () => {
      const next: Record<string, string> = {}
      await Promise.all(
        unresolvedIds.map(async (id) => {
          try {
            const res = await fetch(`${api}/media/${id}?depth=0`, { credentials: 'include' })
            if (!res.ok) return
            const json = (await res.json()) as MediaRef
            const src = json.thumbnailURL || json.url
            if (src) next[id] = src
          } catch {
            // ignore missing media
          }
        }),
      )
      if (!cancelled && Object.keys(next).length) {
        setUrlById((prev) => ({ ...prev, ...next }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [api, unresolvedIds])

  const srcFor = (doc: EventDoc): string => {
    const portrait = directSrc(doc.portraitImage) || urlById[mediaId(doc.portraitImage) || ''] || ''
    if (portrait) return portrait
    return directSrc(doc.bannerImage) || urlById[mediaId(doc.bannerImage) || ''] || ''
  }

  if (!docs.length) {
    return (
      <div className="laf-events-grid laf-events-grid--empty">
        <p>No events yet. Create one to get started.</p>
      </div>
    )
  }

  return (
    <div className="laf-events-grid">
      <ul className="laf-events-grid__list">
        {docs.map((doc) => {
          const src = srcFor(doc)
          const title = doc.title?.trim() || 'Untitled event'
          const isSelected = Boolean(selected?.get(doc.id))
          const isPublished = doc._status === 'published'
          const isPast = doc.status === 'past'

          return (
            <li key={String(doc.id)} className={`laf-events-grid__item${isSelected ? ' is-selected' : ''}`}>
              <div className="laf-events-grid__card">
                <button
                  type="button"
                  className="laf-events-grid__select"
                  aria-label={isSelected ? `Deselect ${title}` : `Select ${title}`}
                  onClick={() => setSelection(doc.id)}
                >
                  <span className={`laf-events-grid__check${isSelected ? ' is-on' : ''}`} />
                </button>

                <Link href={`/admin/collections/events/${doc.id}`} className="laf-events-grid__link">
                  <span className="laf-events-grid__thumb">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" loading="lazy" />
                    ) : (
                      <span className="laf-events-grid__placeholder">No image</span>
                    )}
                    <span className="laf-events-grid__badges">
                      <span className={`laf-events-grid__badge laf-events-grid__badge--${isPast ? 'past' : 'upcoming'}`}>
                        {isPast ? 'Past' : 'Upcoming'}
                      </span>
                      <span
                        className={`laf-events-grid__badge laf-events-grid__badge--${isPublished ? 'live' : 'draft'}`}
                      >
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </span>
                  </span>
                  <span className="laf-events-grid__body">
                    <span className="laf-events-grid__title">{title}</span>
                    {doc.date ? <span className="laf-events-grid__meta">{formatEventDate(doc.date)}</span> : null}
                    {doc.venue ? <span className="laf-events-grid__meta">{doc.venue}</span> : null}
                  </span>
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
