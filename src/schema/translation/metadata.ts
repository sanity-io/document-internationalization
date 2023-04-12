import {TranslateIcon} from '@sanity/icons'
import {defineField, defineType, DocumentDefinition} from 'sanity'

import {METADATA_SCHEMA_NAME} from '../../constants'

export default (schemaTypes: string[]): DocumentDefinition =>
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
        name: 'schemaTypes',
        description:
          'Used to filter the reference fields above so all translations share the same types.',
        type: 'array',
        // For some reason TS dislikes this line because of the DocumentDefinition return type
        // @ts-expect-error
        of: [{type: 'string'}],
        options: {list: schemaTypes},
        readOnly: ({value}) => Boolean(value),
      }),
    ],
    preview: {
      select: {
        translations: 'translations',
        documentSchemaTypes: 'schemaTypes',
      },
      prepare(selection) {
        const {translations, documentSchemaTypes} = selection
        const title =
          translations.length === 1
            ? `1 Translation`
            : `${translations.length} Translations`
        const languageKeys = translations.length
          ? translations
              .map((t: {_key: string}) => t._key.toUpperCase())
              .join(', ')
          : ``
        const subtitle = [
          languageKeys ? `(${languageKeys})` : null,
          documentSchemaTypes?.length
            ? documentSchemaTypes.map((s: string) => s.toUpperCase()).join(`, `)
            : `No Schemas Defined`,
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
