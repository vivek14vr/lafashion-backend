import type { CollectionConfig } from 'payload'
import { titleOptions, viewOnlyFields, yesNoOptions } from './registrationShared'

const CONSENT_CREDIT =
  'Yes, I agree When posting images/videos to credit Hair and makeup Teams, Photographer/Videographer, Sponsors, and any relevant teams @lafcfashionweek @lafashioncloset Production, Staff & Partners. I will provide credit in the form of mentions in comments, tags, stories, posting, and reposts when sharing images to the best of my understanding.'

const CONSENT_LIKENESS =
  'I acknowledge that this is an open-call event during which photography and videography will occur. I hereby relinquish all rights to any photograph and/or video that includes my likeness to LA Fashion Closet, as well as their representatives. I consent to the editing and publication of these photos and videos on various platforms, including social media, websites, blogs, newsletters, magazines, or any other print/digital media. I waive any rights to review or approve the final products.'

export const DesignerRegistrations: CollectionConfig = {
  slug: 'designer-registrations',
  labels: {
    singular: 'Designer registration',
    plural: 'Designer registrations',
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'retailCategory', 'email', 'phone', 'city', 'createdAt'],
    group: 'Website',
    description:
      'Designer open-call submissions from the public registration form. View only — edits are not allowed.',
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
              name: 'looks',
              type: 'select',
              required: true,
              label: 'Looks',
              options: [
                { label: '12', value: '12' },
                { label: '20', value: '20' },
                { label: '30', value: '30' },
                { label: 'Other', value: 'other' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'looksOther',
              type: 'text',
              label: 'Looks (other)',
              admin: {
                width: '50%',
                condition: (_, siblingData) => siblingData?.looks === 'other',
              },
              validate: (
                value: unknown,
                { siblingData }: { siblingData: { looks?: string } },
              ) => {
                if (siblingData?.looks === 'other' && !String(value || '').trim()) {
                  return 'Please specify the number of looks.'
                }
                return true
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'retailCategory',
              type: 'select',
              required: true,
              label: 'Retail category',
              options: [
                { label: 'Athleisure', value: 'athleisure' },
                { label: 'Accessories', value: 'accessories' },
                { label: 'Activewear/Sportswear', value: 'activewear_sportswear' },
                { label: 'Bridal', value: 'bridal' },
                { label: 'Eveningwear/Gowns', value: 'eveningwear_gowns' },
                { label: 'Indigenous', value: 'indigenous' },
                { label: 'Kids/Youth', value: 'kids_youth' },
                { label: 'Lingerie', value: 'lingerie' },
                { label: 'Resort/Swimwear', value: 'resort_swimwear' },
                { label: 'Streetwear', value: 'streetwear' },
                { label: 'Suits', value: 'suits' },
                { label: 'Upcycling/Organic', value: 'upcycling_organic' },
                { label: 'Other', value: 'other' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'retailCategoryOther',
              type: 'text',
              label: 'Retail category (other)',
              admin: {
                width: '50%',
                condition: (_, siblingData) => siblingData?.retailCategory === 'other',
              },
              validate: (
                value: unknown,
                { siblingData }: { siblingData: { retailCategory?: string } },
              ) => {
                if (
                  siblingData?.retailCategory === 'other' &&
                  !String(value || '').trim()
                ) {
                  return 'Please specify your retail category.'
                }
                return true
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
      label: 'Experience',
      fields: [
        {
          name: 'runwayExperience',
          type: 'select',
          required: true,
          label: 'Fashion Week runway experience?',
          options: yesNoOptions,
        },
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
            { label: 'India FW', value: 'india_fw' },
            { label: 'Cannes FW', value: 'cannes_fw' },
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
          name: 'consentCredit',
          type: 'checkbox',
          required: true,
          label: 'Consent: credit production teams',
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
