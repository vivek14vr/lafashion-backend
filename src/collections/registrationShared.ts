import type { Field } from 'payload'

/** Mark every leaf field read-only in admin (submissions are view-only). */
export function viewOnlyFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    if ('fields' in field && Array.isArray(field.fields)) {
      return { ...field, fields: viewOnlyFields(field.fields) }
    }
    if ('name' in field && field.name) {
      return {
        ...field,
        admin: {
          ...('admin' in field ? field.admin : {}),
          readOnly: true,
        },
      } as Field
    }
    return field
  })
}

export const titleOptions = [
  { label: 'Mr.', value: 'mr' },
  { label: 'Ms.', value: 'ms' },
  { label: 'Other', value: 'other' },
]

export const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

export const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]
