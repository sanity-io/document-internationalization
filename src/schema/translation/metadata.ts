import {defineType, defineField} from 'sanity'
import {TranslateIcon} from '@sanity/icons'

import {METADATA_SCHEMA_NAME} from '../../constants'

export default defineType({
  type: 'document',
  name: METADATA_SCHEMA_NAME,
  title: 'Translation metadata',
  icon: TranslateIcon,
  liveEdit: true,
  fields: [
    defineField({
      name: 'translations',
      type: 'internationalizedArrayReference',
    }),
    defineField({
      name: 'schemaType',
      type: 'string',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      translations: 'translations',
      schemaType: 'schemaType',
    },
    prepare(selection: any) {
      const {translations, schemaType} = selection
      const title =
        translations.length === 1 ? `1 Translation` : `${translations.length} Translations`
      const languageKeys = translations.length
        ? translations.map((t: {_key: string}) => t._key.toUpperCase()).join(', ')
        : ``

      return {
        title,
        subtitle: `${schemaType?.toUpperCase()}: ${languageKeys}`,
      }
    },
  },
})
