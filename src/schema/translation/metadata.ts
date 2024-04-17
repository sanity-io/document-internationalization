import {TranslateIcon} from '@sanity/icons'
import {
  defineField,
  defineType,
  type DocumentDefinition,
  type FieldDefinition,
} from 'sanity'

import {METADATA_SCHEMA_NAME, TRANSLATIONS_ARRAY_NAME} from '../../constants'

export default (
  schemaTypes: string[],
  metadataFields: FieldDefinition[]
): DocumentDefinition =>
  defineType({
    type: 'document',
    name: METADATA_SCHEMA_NAME,
    title: 'Translation metadata',
    icon: TranslateIcon,
    liveEdit: true,
    fields: [
      defineField({
        name: TRANSLATIONS_ARRAY_NAME,
        type: 'internationalizedArrayReference',
      }),
      defineField({
        name: 'schemaTypes',
        description:
          'Optional: Used to filter the reference fields above so all translations share the same types.',
        type: 'array',
        of: [{type: 'string'}],
        options: {list: schemaTypes},
        readOnly: ({value}) => Boolean(value),
      }),
      ...metadataFields,
    ],
    preview: {
      select: {
        translations: TRANSLATIONS_ARRAY_NAME,
        documentSchemaTypes: 'schemaTypes',
      },
      prepare(selection) {
        const {translations = [], documentSchemaTypes = []} = selection
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
            ? documentSchemaTypes.map((s: string) => s).join(`, `)
            : ``,
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
