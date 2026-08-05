import type { CollectionConfig } from 'payload'
import {
  genderOptions,
  titleOptions,
  viewOnlyFields,
  yesNoOptions,
} from './registrationShared'

const CONSENT_UNPAID =
  'Yes, I am aware that participation in events powered by LA Fashion Closet is not a paid opportunity but provides me a platform for exposure. I agree to participate in events powered by LA Fashion Closet with this understanding. Additionally, I understand that I will have to bear any travel and/or accommodation expenses, including any other expenses related to my participation in the event. LA Fashion Closet is not responsible for any expenses incurred.'

const CONSENT_CREDIT =
  'Yes, I agree When posting images/videos to credit all Designers, Hair and makeup Teams, Photographer/Videographer, Sponsors, and any relevant teams @lafcfashionweek @lafashioncloset Production, Staff & Partners. I will provide credit in the form of mentions in comments, tags, stories, posting, and reposts when sharing images to the best of my understanding.'

const CONSENT_LIKENESS =
  'I acknowledge that this is an open-call event during which photography and videography will occur. I hereby relinquish all rights to any photograph and/or video that includes my likeness to LA Fashion Closet, as well as their representatives. I consent to the editing and publication of these photos and videos on various platforms, including social media, websites, blogs, newsletters, magazines, or any other print/digital media. I waive any rights to review or approve the final products.'

const CONSENT_MEDIA =
  'I, Photographer/Videographer/Other Media, hereby grant and authorize LA Fashion Closet the right to take, edit, alter, copy, exhibit, publish, distribute and make use of any and all pictures or video taken by myself to be used in and/or for legally promotional materials including, but not limited to, newsletters, flyers, posters, brochures, fundraising letters, annual reports, press kits and submissions to journalists, websites, magazines, social networking sites and other print and digital communications, without payment or any other consideration. This authorization extends to all languages, media, formats and markets now known or hereafter devised. This authorization shall continue indefinitely for all media submitted or captured in events by LA Fashion Closet, unless I otherwise revoke said authorization in writing. I understand and agree that these materials shall become the property of LA Fashion Closet and will not be returned. I hereby hold harmless, and release LA Fashion Closet from all liability, petitions, and causes of action which I, my heirs, representative, executors, administrators, or any other persons may make while acting on my behalf or on behalf of my estate. I hereby agree that I will upload all photos/videos taken by me to the drive/location as specified by LA Fashion Closet.'

export const CommunityRegistrations: CollectionConfig = {
  slug: 'community-registrations',
  labels: {
    singular: 'Community registration',
    plural: 'Community registrations',
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'role', 'email', 'phone', 'city', 'createdAt'],
    group: 'Website',
    description:
      'Community open-call submissions (creators, media, performers, influencers, volunteers, sponsors, MUAs). View only — edits are not allowed.',
  },
  access: {
    // The public form must remain usable even when the browser has an admin session.
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: () => false,
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const first = String(data.firstName || '').trim()
        const last = String(data.lastName || '').trim()
        data.displayName = [first, last].filter(Boolean).join(' ') || data.email || 'Registration'
        return data
      },
    ],
  },
  fields: viewOnlyFields([
    {
      name: 'displayName',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-generated from first + last name for list views.',
      },
    },
    {
      type: 'collapsible',
      label: 'Identity',
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          label: 'I am',
          options: [
            { label: 'Content Creator', value: 'content_creator' },
            { label: 'Press/Media', value: 'press_media' },
            { label: 'Performer', value: 'performer' },
            { label: 'Influencer', value: 'influencer' },
            { label: 'Volunteer', value: 'volunteer' },
            { label: 'Sponsor', value: 'sponsor' },
            { label: 'MUA', value: 'mua' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'roleOther',
          type: 'text',
          label: 'Role (other)',
          admin: {
            condition: (_, siblingData) => siblingData?.role === 'other',
          },
          validate: (
            value: unknown,
            { siblingData }: { siblingData: { role?: string } },
          ) => {
            if (siblingData?.role === 'other' && !String(value || '').trim()) {
              return 'Please specify your role.'
            }
            return true
          },
        },
        {
          name: 'title',
          type: 'select',
          options: titleOptions,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'firstName',
              type: 'text',
              required: true,
              label: 'First name',
              admin: { width: '50%' },
            },
            {
              name: 'lastName',
              type: 'text',
              required: true,
              label: 'Last name',
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'phone',
              type: 'text',
              required: true,
              label: 'Phone number',
              admin: { width: '50%' },
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              label: 'Email address',
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'instagramUrl',
          type: 'text',
          required: true,
          label: 'Instagram URL',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'gender',
              type: 'select',
              required: true,
              options: genderOptions,
              admin: { width: '50%' },
            },
            {
              name: 'genderOther',
              type: 'text',
              label: 'Gender (other)',
              admin: {
                width: '50%',
                condition: (_, siblingData) => siblingData?.gender === 'other',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'city',
              type: 'text',
              required: true,
              admin: { width: '50%' },
            },
            {
              name: 'state',
              type: 'text',
              required: true,
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Event interest',
      fields: [
        {
          name: 'locations',
          type: 'select',
          required: true,
          hasMany: true,
          label: 'Locations interested in',
          options: [
            { label: 'NYFW', value: 'nyfw' },
            { label: 'Los Angeles FW', value: 'la_fw' },
            { label: 'Las Vegas FW', value: 'las_vegas_fw' },
            { label: 'Milan FW', value: 'milan_fw' },
            { label: 'Paris FW', value: 'paris_fw' },
            { label: 'London FW', value: 'london_fw' },
            { label: 'Delhi FW', value: 'delhi_fw' },
          ],
        },
        {
          name: 'isMinor',
          type: 'select',
          required: true,
          label: 'Are you a minor under 18?',
          options: yesNoOptions,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Consents & signature',
      fields: [
        {
          name: 'consentUnpaid',
          type: 'checkbox',
          required: true,
          label: 'Consent: unpaid exposure / expenses',
          admin: { description: CONSENT_UNPAID },
          validate: (value) => (value === true ? true : 'This consent is required.'),
        },
        {
          name: 'consentCredit',
          type: 'checkbox',
          required: true,
          label: 'Consent: credit designers & production teams',
          admin: { description: CONSENT_CREDIT },
          validate: (value) => (value === true ? true : 'This consent is required.'),
        },
        {
          name: 'consentLikeness',
          type: 'checkbox',
          required: true,
          label: 'Consent: photography & likeness rights',
          admin: { description: CONSENT_LIKENESS },
          validate: (value) => (value === true ? true : 'This consent is required.'),
        },
        {
          name: 'consentMedia',
          type: 'checkbox',
          required: true,
          label: 'Consent: media / photographer release',
          admin: { description: CONSENT_MEDIA },
          validate: (value) => (value === true ? true : 'This consent is required.'),
        },
        {
          type: 'row',
          fields: [
            {
              name: 'signatureName',
              type: 'text',
              required: true,
              label: 'Signature (type full name)',
              admin: { width: '50%' },
            },
            {
              name: 'signatureDate',
              type: 'date',
              required: true,
              label: 'Signature date',
              admin: {
                width: '50%',
                date: { pickerAppearance: 'dayOnly' },
              },
            },
          ],
        },
      ],
    },
  ]),
}
