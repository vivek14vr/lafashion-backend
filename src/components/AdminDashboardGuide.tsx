import React from 'react'

const cards = [
  {
    href: '/admin/collections/events',
    title: 'Events',
    blurb: 'Create runway nights, set date & venue, add ticket links.',
    icon: '✦',
    tone: 'gold',
  },
  {
    href: '/admin/collections/galleries',
    title: 'Galleries',
    blurb: 'Upload photo archives for past shows.',
    icon: '▣',
    tone: 'cream',
  },
  {
    href: '/admin/globals/home-destinations',
    title: 'City snaps',
    blurb: 'Rotating photos for homepage destination cards.',
    icon: '◎',
    tone: 'copper',
  },
  {
    href: '/admin/collections/media',
    title: 'Media',
    blurb: 'Shared Cloudinary image library.',
    icon: '◡',
    tone: 'gold',
  },
  {
    href: '/admin/collections/users',
    title: 'Admin users',
    blurb: 'Who can sign in to this CMS.',
    icon: '◉',
    tone: 'cream',
  },
]

/** Welcome guide shown above the default dashboard collection cards */
export default function AdminDashboardGuide() {
  return (
    <div className="laf-guide">
      <p className="laf-guide__eyebrow">Content studio</p>
      <h2 className="laf-guide__title">LA Fashion Closet</h2>
      <p className="laf-guide__intro">
        Edit what visitors see on the public site. Event edits autosave as drafts — click{' '}
        <strong>Publish</strong> when ready to go live.
      </p>

      <div className="laf-guide__grid">
        {cards.map((card) => (
          <a key={card.href} href={card.href} className={`laf-guide__card laf-guide__card--${card.tone}`}>
            <span className="laf-guide__icon" aria-hidden>
              {card.icon}
            </span>
            <strong>{card.title}</strong>
            <span>{card.blurb}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
