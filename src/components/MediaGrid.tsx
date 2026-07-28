'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useListDrawerContext, useListQuery, useSelection } from '@payloadcms/ui'

type MediaDoc = {
  id: string | number
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  mimeType?: string | null
  alt?: string | null
}

const BATCH = 24

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function mediaSrc(doc: MediaDoc): string {
  return doc.thumbnailURL || doc.url || ''
}

/** Thumbnail grid above (and replacing) the default media table — infinite scroll */
export default function MediaGrid() {
  const pathname = usePathname()
  const { data, handlePerPageChange, refineListData, collectionSlug } = useListQuery()
  const { selected, setSelection, count } = useSelection()
  const drawer = useListDrawerContext()
  const [loadingMore, setLoadingMore] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const onSelect = drawer?.onSelect
  const onBulkSelect = drawer?.onBulkSelect
  const isInDrawer = Boolean(drawer?.isInDrawer || drawer?.drawerSlug)

  const docs = useMemo(() => (data?.docs ?? []) as MediaDoc[], [data?.docs])
  const totalDocs = data?.totalDocs ?? 0
  const currentLimit = Number(data?.limit) || BATCH
  const hasMore = docs.length < totalDocs
  const relationSlug = (collectionSlug || 'media') as 'media'
  // Full library page only — never treat the relationship drawer as the library page
  const isFullListPage = !isInDrawer && Boolean(pathname?.includes('/collections/media'))
  const allowBulk = isInDrawer && typeof onBulkSelect === 'function'

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoadingMore(true)
    try {
      const nextLimit = Math.min(totalDocs, currentLimit + BATCH)
      if (handlePerPageChange) {
        await handlePerPageChange(nextLimit)
      } else {
        await refineListData({ limit: nextLimit, page: 1 })
      }
    } finally {
      loadingRef.current = false
      setLoadingMore(false)
    }
  }, [currentLimit, handlePerPageChange, hasMore, refineListData, totalDocs])

  useEffect(() => {
    if (!hasMore || loadingMore) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const rootMargin = 280
    const check = () => {
      const rect = sentinel.getBoundingClientRect()
      if (rect.top < window.innerHeight + rootMargin) void loadMore()
    }

    check()
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore()
      },
      { root: null, rootMargin: `${rootMargin}px 0px`, threshold: 0 },
    )
    observer.observe(sentinel)
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [hasMore, loadMore, loadingMore, docs.length])

  const pickDoc = useCallback(
    (doc: MediaDoc) => {
      const payload = {
        collectionSlug: relationSlug,
        doc,
        docID: doc.id as string,
      }

      // 1) Preferred: relationship drawer callback (assigns field + closes drawer)
      if (typeof onSelect === 'function') {
        try {
          void Promise.resolve(onSelect(payload)).catch((err) => {
            console.error('[MediaGrid] onSelect failed', err)
            clickHiddenTableCell(doc.id)
          })
          return
        } catch (err) {
          console.error('[MediaGrid] onSelect threw', err)
        }
      }

      // 2) Fallback: click Payload’s hidden table cell (same handler as default list)
      if (clickHiddenTableCell(doc.id)) return

      setSelection(doc.id)
    },
    [onSelect, relationSlug, setSelection],
  )

  function clickHiddenTableCell(id: string | number): boolean {
    const scope = rootRef.current?.closest('.list-drawer, .collection-list') ?? document
    const cell = scope.querySelector(
      `tr[data-id="${String(id)}"] .default-cell__first-cell, tr[data-id="${String(id)}"] button[type="button"]`,
    ) as HTMLElement | null
    if (!cell) return false
    cell.click()
    return true
  }

  if (!docs.length && !loadingMore) {
    return (
      <div className="laf-media-grid laf-media-grid--empty" ref={rootRef}>
        <p>No media yet. Upload images with Create New.</p>
      </div>
    )
  }

  return (
    <div className="laf-media-grid" ref={rootRef} data-in-drawer={isInDrawer ? 'true' : 'false'}>
      {isInDrawer ? (
        <p className="laf-media-grid__hint">Click an image to select it</p>
      ) : null}

      {allowBulk && count > 0 ? (
        <div className="laf-media-grid__bulk">
          <button
            type="button"
            className="laf-media-grid__bulk-btn"
            onClick={() => onBulkSelect?.(selected, relationSlug)}
          >
            Select {count}
          </button>
        </div>
      ) : null}

      <ul className="laf-media-grid__list">
        {docs.map((doc) => {
          const src = mediaSrc(doc)
          const name = doc.filename || String(doc.id)
          const isSelected = Boolean(selected?.get(doc.id))
          const meta = [formatBytes(doc.filesize), doc.width && doc.height ? `${doc.width}×${doc.height}` : '']
            .filter(Boolean)
            .join(' · ')

          const cardInner = (
            <>
              <span className="laf-media-grid__thumb">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={name} loading="lazy" />
                ) : (
                  <span className="laf-media-grid__placeholder">No preview</span>
                )}
                {isInDrawer ? <span className="laf-media-grid__select-label">Select</span> : null}
              </span>
              <span className="laf-media-grid__caption">
                <span className="laf-media-grid__name" title={name}>
                  {name.split('/').pop()}
                </span>
                {meta ? <span className="laf-media-grid__meta">{meta}</span> : null}
              </span>
            </>
          )

          return (
            <li key={String(doc.id)} className={`laf-media-grid__item${isSelected ? ' is-selected' : ''}`}>
              {allowBulk ? (
                <button
                  type="button"
                  className="laf-media-grid__check-btn"
                  aria-label={isSelected ? `Deselect ${name}` : `Multi-select ${name}`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelection(doc.id)
                  }}
                >
                  <span className={`laf-media-grid__check${isSelected ? ' is-on' : ''}`} />
                </button>
              ) : null}

              {isFullListPage ? (
                <Link href={`/admin/collections/media/${doc.id}`} className="laf-media-grid__card">
                  {cardInner}
                </Link>
              ) : (
                <button
                  type="button"
                  className="laf-media-grid__card"
                  aria-label={`Select ${name}`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    pickDoc(doc)
                  }}
                >
                  {cardInner}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <div className="laf-media-grid__footer" ref={sentinelRef}>
        {loadingMore ? (
          <p className="laf-media-grid__status">Loading more…</p>
        ) : hasMore ? (
          <div className="laf-media-grid__more">
            <p className="laf-media-grid__status">
              Showing {docs.length} of {totalDocs}
            </p>
            <button type="button" className="laf-media-grid__load-btn" onClick={() => void loadMore()}>
              Load more
            </button>
          </div>
        ) : totalDocs > 0 ? (
          <p className="laf-media-grid__status">
            {totalDocs} {totalDocs === 1 ? 'image' : 'images'}
          </p>
        ) : null}
      </div>
    </div>
  )
}
