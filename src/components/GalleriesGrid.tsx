'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useConfig, useListQuery, useSelection } from '@payloadcms/ui'

type MediaRef = {
  id?: string | number
  url?: string | null
  thumbnailURL?: string | null
}

type GalleryDoc = {
  id: string | number
  title?: string | null
  date?: string | null
  location?: string | null
  published?: boolean | null
  coverImage?: MediaRef | string | null
  images?: (MediaRef | string)[] | null
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

function formatMonth(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

/** Card grid replacing the default galleries table */
export default function GalleriesGrid() {
  const { data } = useListQuery()
  const { selected, setSelection } = useSelection()
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const [urlById, setUrlById] = useState<Record<string, string>>({})

  const docs = useMemo(() => (data?.docs ?? []) as GalleryDoc[], [data?.docs])

  const unresolvedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const doc of docs) {
      const candidates = [doc.coverImage, ...(doc.images ?? []).slice(0, 1)]
      for (const field of candidates) {
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
            // ignore
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

  const coverSrc = (doc: GalleryDoc): string => {
    const fromCover = directSrc(doc.coverImage) || urlById[mediaId(doc.coverImage) || ''] || ''
    if (fromCover) return fromCover
    const first = doc.images?.[0]
    return directSrc(first) || urlById[mediaId(first) || ''] || ''
  }

  if (!docs.length) {
    return (
      <div className="laf-galleries-grid laf-galleries-grid--empty">
        <p>No galleries yet. Create one to get started.</p>
      </div>
    )
  }

  return (
    <div className="laf-galleries-grid">
      <ul className="laf-galleries-grid__list">
        {docs.map((doc) => {
          const src = coverSrc(doc)
          const title = doc.title?.trim() || 'Untitled gallery'
          const isSelected = Boolean(selected?.get(doc.id))
          const isPublished = Boolean(doc.published)
          const photoCount = Array.isArray(doc.images) ? doc.images.length : 0

          return (
            <li
              key={String(doc.id)}
              className={`laf-galleries-grid__item${isSelected ? ' is-selected' : ''}`}
            >
              <div className="laf-galleries-grid__card">
                <button
                  type="button"
                  className="laf-galleries-grid__select"
                  aria-label={isSelected ? `Deselect ${title}` : `Select ${title}`}
                  onClick={() => setSelection(doc.id)}
                >
                  <span className={`laf-galleries-grid__check${isSelected ? ' is-on' : ''}`} />
                </button>

                <Link href={`/admin/collections/galleries/${doc.id}`} className="laf-galleries-grid__link">
                  <span className="laf-galleries-grid__thumb">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" loading="lazy" />
                    ) : (
                      <span className="laf-galleries-grid__placeholder">No image</span>
                    )}
                    <span className="laf-galleries-grid__badges">
                      {photoCount > 0 ? (
                        <span className="laf-galleries-grid__badge laf-galleries-grid__badge--count">
                          {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                        </span>
                      ) : null}
                      <span
                        className={`laf-galleries-grid__badge laf-galleries-grid__badge--${isPublished ? 'live' : 'draft'}`}
                      >
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </span>
                  </span>
                  <span className="laf-galleries-grid__body">
                    <span className="laf-galleries-grid__title">{title}</span>
                    {doc.date ? (
                      <span className="laf-galleries-grid__meta">{formatMonth(doc.date)}</span>
                    ) : null}
                    {doc.location ? (
                      <span className="laf-galleries-grid__meta">{doc.location}</span>
                    ) : null}
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
