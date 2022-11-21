import {defineType, defineField} from 'sanity'
import {TranslateIcon} from '@sanity/icons'

import {METADATA_SCHEMA_NAME} from '../../constants'

// TODO: TS having a hard time determining the return type here. Likely a V3 type problem.
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
        name: 'schemaTypes',
        description:
          'Used to filter the reference fields above so all translations share the same types.',
        type: 'array',
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
          translations.length === 1 ? `1 Translation` : `${translations.length} Translations`
        const languageKeys = translations.length
          ? translations.map((t: {_key: string}) => t._key.toUpperCase()).join(', ')
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
