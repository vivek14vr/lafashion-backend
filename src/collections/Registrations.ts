import type { CollectionConfig } from 'payload'
import {
  genderOptions,
  titleOptions,
  viewOnlyFields,
  yesNoOptions,
} from './registrationShared'

const CONSENT_UNPAID =
  'Yes, I am aware that participation in events powered by LA Fashion Closet is not a paid opportunity but provides me a platform for exposure. I agree to participate in events powered by LA Fashion Closet with this understanding. Additionally, I understand that I will have to bear any travel and/or accommodation expenses, including any other expenses related to my participation in the event. LA Fashion Closet is not responsible for any expenses incurred by the model.'

const CONSENT_EXPENSES =
  'Additionally, I understand that I will have to bear any travel and/or accommodation expenses, including any other expenses related to my participation in the event. LA Fashion Closet is not responsible for any expenses incurred by the model.'

const CONSENT_CREDIT =
  'Yes, I agree When posting images/videos to credit all Designers, Hair and makeup Teams, Photographer/Videographer, Sponsors, and any relevant teams @lafcfashionweek @lafashioncloset Production, Staff & Partners. I will provide credit in the form of mentions in comments, tags, stories, posting, and reposts when sharing images to the best of my understanding.'

const CONSENT_LIKENESS =
  'I acknowledge that this is an open-call event during which photography and videography will occur. I hereby relinquish all rights to any photograph and/or video that includes my likeness to LA Fashion Closet, as well as their representatives. I consent to the editing and publication of these photos and videos on various platforms, including social media, websites, blogs, newsletters, magazines, or any other print/digital media. I waive any rights to review or approve the final products.'

const CONSENT_RELEASE =
  'I, Model, in consideration of my engagement as a model, and for other good and valuable consideration herein acknowledged as received, hereby grant the following rights and permissions to LA Fashion Closet, their legal representatives, and assigns, those for whom Photographer/Videographer is acting, and those acting with his/her authority and permission. I hereby grant to them the unalterable, perpetual and unrestricted right and permission to take, use, reuse, publish, and republish photographic portraits or pictures or videos of me or in which I may be included, in whole or in part, or composite or distorted in character or form, without restriction as to changes or alterations, in conjunction with my own or a fictitious name. I grant them the unalterable, perpetual and unrestricted right and permission to do so in any and all media now or hereafter known. This includes but is not limited to print media and internet distribution for illustration, exhibit, promotion, art, editorial, advertising, trade, magazine, social media or any other purpose whatsoever. I hereby give my consent for the digital compositing or distortion of portraits or pictures or videos, including but not limited to changes or alterations in terms of color, size, shape, perspective, context, foreground or background. I also consent to the use of any published materials in conjunction with such photographs or videos. I waive any right to inspect or approve the finished product or products, and the advertising copy or other matter that may be used in connection with them, or the use to which they may be applied. I release, discharge, and agree to hold harmless LA Fashion Closet and all persons acting under his/her permission or authority from any liability by virtue of any blurring, distortion, alteration, optical illusion, or use in composite form. This is valid for all media submitted or captured in events by LA Fashion Closet. I hereby warrant that I am of full age and have the right to contract in my own name. I have read the above release, and agreement before its execution and I am familiar with its contents. This document is binding upon me and my heirs, legal representatives, and assigns.'

export const Registrations: CollectionConfig = {
  slug: 'registrations',
  labels: {
    singular: 'Model registration',
    plural: 'Model registrations',
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'email', 'phone', 'city', 'createdAt'],
    group: 'Website',
    description:
      'Model open-call submissions from the public registration form. View only — edits are not allowed.',
    components: {
      edit: {
        SaveButton: '/components/RegistrationSaveButton',
      },
    },
  },
  access: {
    // Public form (no user) can create; admins cannot create/edit in the panel
    create: ({ req: { user } }) => !user,
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
      label: 'Measurements',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'height',
              type: 'text',
              required: true,
              label: 'Height (ft)',
              admin: { width: '50%', description: "Example: 5'6\"" },
            },
            {
              name: 'weight',
              type: 'text',
              required: true,
              label: 'Weight (lbs)',
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'bustChest',
              type: 'text',
              required: true,
              label: 'Bust/Chest (inches)',
              admin: { width: '33%' },
            },
            {
              name: 'waist',
              type: 'text',
              required: true,
              label: 'Waist (inches)',
              admin: { width: '33%' },
            },
            {
              name: 'hips',
              type: 'text',
              required: true,
              label: 'Hips (inches)',
              admin: { width: '33%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'dressSize',
              type: 'select',
              required: true,
              label: 'Dress size (US)',
              options: ['0', '2', '4', '6', '8', '10', '12', '14', '16'].map((v) => ({
                label: v,
                value: v,
              })),
              admin: { width: '33%' },
            },
            {
              name: 'suitSize',
              type: 'select',
              required: true,
              label: 'Dress/Suit size (US)',
              options: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((v) => ({
                label: v,
                value: v,
              })),
              admin: { width: '33%' },
            },
            {
              name: 'shoeSize',
              type: 'text',
              required: true,
              label: 'Shoe size (US)',
              admin: { width: '33%' },
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
            { label: 'Cannes FW', value: 'cannes_fw' },
            { label: 'Delhi FW', value: 'delhi_fw' },
          ],
        },
        {
          name: 'publishedModel',
          type: 'select',
          required: true,
          label: 'Are you a published model?',
          options: yesNoOptions,
        },
        {
          name: 'publishedWhere',
          type: 'textarea',
          label: 'Where did you get published?',
          admin: {
            condition: (_, siblingData) => siblingData?.publishedModel === 'yes',
          },
          validate: (value, { siblingData }) => {
            const data = siblingData as { publishedModel?: string }
            if (data?.publishedModel === 'yes' && !String(value || '').trim()) {
              return 'Please share where you were published.'
            }
            return true
          },
        },
        {
          name: 'agencyStatus',
          type: 'select',
          required: true,
          label: 'Currently represented by a modeling agency?',
          options: [
            { label: 'Yes, Exclusive', value: 'exclusive' },
            { label: 'Yes, Non Exclusive', value: 'non_exclusive' },
            { label: 'No', value: 'no' },
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
          label: 'Consent: unpaid exposure / participation',
          admin: { description: CONSENT_UNPAID },
          validate: (value) => (value === true ? true : 'This consent is required.'),
        },
        {
          name: 'consentExpenses',
          type: 'checkbox',
          required: true,
          label: 'Consent: travel & accommodation expenses',
          admin: { description: CONSENT_EXPENSES },
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
          name: 'consentRelease',
          type: 'checkbox',
          required: true,
          label: 'Consent: full model release',
          admin: { description: CONSENT_RELEASE },
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
