'use client'

import React, { useMemo, useState } from 'react'
import { Button, useField, useFormFields } from '@payloadcms/ui'
import { usePublishEventAndReturn } from './usePublishEventAndReturn'

const STEPS = [
  {
    id: 1,
    label: 'Basics',
    hint: 'Title, date & venue',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 2,
    label: 'Images',
    hint: 'Portrait & banner',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10.5" r="1.5" />
        <path d="m21 15-4.5-4.5L7 20" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 3,
    label: 'Tickets',
    hint: 'Booking link',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9z" strokeLinejoin="round" />
        <path d="M12 7v10" strokeLinecap="round" strokeDasharray="2 3" />
      </svg>
    ),
  },
] as const

type StepId = (typeof STEPS)[number]['id']

function isFilled(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'object') return true
  return Boolean(value)
}

/** Full-width step wizard for creating/editing events */
export default function EventStepNav() {
  const { value, setValue } = useField<number>({ path: 'createStep' })
  const step = (value && value >= 1 && value <= 3 ? value : 1) as StepId
  const [error, setError] = useState<string | null>(null)
  const { publishAndReturn, publishing } = usePublishEventAndReturn()

  const formSnapshot = useFormFields(([fields]) => ({
    title: fields.title?.value,
    date: fields.date?.value,
    venue: fields.venue?.value,
    excerpt: fields.excerpt?.value,
    portraitImage: fields.portraitImage?.value,
    bannerImage: fields.bannerImage?.value,
  }))

  const progress = useMemo(() => ((step - 1) / (STEPS.length - 1)) * 100, [step])

  const goTo = (next: StepId) => {
    setError(null)
    setValue(next)
    window.requestAnimationFrame(() => {
      document.querySelector('.document-fields__edit')?.scrollTo?.({ top: 0, behavior: 'smooth' })
    })
  }

  const validateCurrent = (): boolean => {
    if (step === 1) {
      if (
        !isFilled(formSnapshot.title) ||
        !isFilled(formSnapshot.date) ||
        !isFilled(formSnapshot.venue) ||
        !isFilled(formSnapshot.excerpt)
      ) {
        setError('Fill in title, date & time, venue, and summary to continue.')
        return false
      }
    }
    if (step === 2) {
      if (!isFilled(formSnapshot.portraitImage) || !isFilled(formSnapshot.bannerImage)) {
        setError('Add both portrait and banner images to continue.')
        return false
      }
    }
    return true
  }

  const validateAll = (): boolean => {
    if (
      !isFilled(formSnapshot.title) ||
      !isFilled(formSnapshot.date) ||
      !isFilled(formSnapshot.venue) ||
      !isFilled(formSnapshot.excerpt)
    ) {
      setError('Fill in title, date & time, venue, and summary before publishing.')
      goTo(1)
      return false
    }
    if (!isFilled(formSnapshot.portraitImage) || !isFilled(formSnapshot.bannerImage)) {
      setError('Add both portrait and banner images before publishing.')
      goTo(2)
      return false
    }
    return true
  }

  const onNext = () => {
    if (!validateCurrent()) return
    if (step < 3) goTo((step + 1) as StepId)
  }

  const onBack = () => {
    setError(null)
    if (step > 1) goTo((step - 1) as StepId)
  }

  const onPublish = async () => {
    if (!validateAll()) return
    setError(null)
    const ok = await publishAndReturn()
    if (!ok) {
      setError('Could not publish. Check required fields, then try again.')
    }
  }

  return (
    <div className="laf-steps">
      <div className="laf-steps__top">
        <div>
          <p className="laf-steps__eyebrow">Event wizard</p>
          <h3 className="laf-steps__title">
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </h3>
          <p className="laf-steps__hint">{STEPS[step - 1].hint}</p>
        </div>
        <div className="laf-steps__actions laf-steps__actions--top">
          <Button buttonStyle="secondary" disabled={step <= 1 || publishing} onClick={onBack} type="button" size="small">
            ← Back
          </Button>
          {step < 3 ? (
            <Button buttonStyle="primary" onClick={onNext} type="button" size="small" disabled={publishing}>
              Next →
            </Button>
          ) : (
            <Button
              buttonStyle="primary"
              onClick={() => void onPublish()}
              type="button"
              size="small"
              disabled={publishing}
            >
              {publishing ? 'Publishing…' : 'Publish & finish'}
            </Button>
          )}
        </div>
      </div>

      <div className="laf-steps__track" aria-hidden>
        <div className="laf-steps__progress" style={{ width: `${progress}%` }} />
      </div>

      <ol className="laf-steps__list laf-steps__list--3">
        {STEPS.map((item) => {
          const state = item.id === step ? 'current' : item.id < step ? 'done' : 'todo'
          return (
            <li key={item.id} className={`laf-steps__item laf-steps__item--${state}`}>
              <button
                type="button"
                className="laf-steps__button"
                disabled={publishing}
                onClick={() => {
                  if (item.id <= step) {
                    goTo(item.id)
                    return
                  }
                  if (!validateCurrent()) return
                  if (item.id === step + 1) goTo(item.id)
                }}
              >
                <span className="laf-steps__icon">{item.id < step ? '✓' : item.icon}</span>
                <span className="laf-steps__meta">
                  <span className="laf-steps__label">{item.label}</span>
                  <span className="laf-steps__sub">{item.hint}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      {error ? <p className="laf-steps__error">{error}</p> : null}
    </div>
  )
}
