import {defineType, defineField} from 'sanity'
import {TranslateIcon} from '@sanity/icons'

import {METADATA_SCHEMA_NAME} from '../../constants'

// eslint-disable-next-line no-warning-comments
// FIXME: TS having a hard time determining the return type here. Likely a V3 type problem.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (schemaTypes: string[]) =>
  defineType({
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
        description:
          'Used to scope the reference fields above to validate all translations share the same type. Field is locked once a value is selected.',
        type: 'string',
        options: {
          list: schemaTypes,
          layout: `radio`,
        },
        readOnly: ({value}) => Boolean(value),
      }),
    ],
    preview: {
      select: {
        translations: 'translations',
        schemaType: 'schemaType',
      },
      prepare(selection) {
        const {translations, schemaType} = selection
        const title =
          translations.length === 1 ? `1 Translation` : `${translations.length} Translations`
        const languageKeys = translations.length
          ? translations.map((t: {_key: string}) => t._key.toUpperCase()).join(', ')
          : ``
        const subtitle = [
          languageKeys ? `(${languageKeys})` : null,
          schemaType ? schemaType.toUpperCase() : `No Schema Defined`,
        ]
          .filter(Boolean)
          .join(` `)

        return {
          title,
          subtitle,
        }
      },
    },
  })
