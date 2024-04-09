import {Stack} from '@sanity/ui'
import {defineField, definePlugin, isSanityDocument} from 'sanity'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'

import {DeleteMetadataAction} from './actions/DeleteMetadataAction'
import {LanguageBadge} from './badges'
import BulkPublish from './components/BulkPublish'
import {DocumentInternationalizationProvider} from './components/DocumentInternationalizationContext'
import {DocumentInternationalizationMenu} from './components/DocumentInternationalizationMenu'
import OptimisticallyStrengthen from './components/OptimisticallyStrengthen'
import {API_VERSION, DEFAULT_CONFIG, METADATA_SCHEMA_NAME} from './constants'
import metadata from './schema/translation/metadata'
import type {PluginConfig, TranslationReference} from './types'

export const documentInternationalization = definePlugin<PluginConfig>(
  (config) => {
    const pluginConfig = {...DEFAULT_CONFIG, ...config}
    const {
      supportedLanguages,
      schemaTypes,
      languageField,
      bulkPublish,
      metadataFields,
    } = pluginConfig

    if (schemaTypes.length === 0) {
      throw new Error(
        'You must specify at least one schema type on which to enable document internationalization. Update the `schemaTypes` option in the documentInternationalization() configuration.'
      )
    }

    return {
      name: '@sanity/document-internationalization',

      studio: {
        components: {
          layout: (props) =>
            DocumentInternationalizationProvider({...props, pluginConfig}),
        },
      },

      // Adds:
      // - A bulk-publishing UI component to the form
      // - Will only work for projects on a compatible plan
      form: {
        components: {
          input: (props) => {
            if (
              props.id === 'root' &&
              props.schemaType.name === METADATA_SCHEMA_NAME &&
              isSanityDocument(props?.value)
            ) {
              const metadataId = props?.value?._id
              const translations =
                (props?.value?.translations as TranslationReference[]) ?? []
              const weakAndTypedTranslations = translations.filter(
                ({value}) => value?._weak && value._strengthenOnPublish
              )

              return (
                <Stack space={5}>
                  {bulkPublish ? (
                    <BulkPublish translations={translations} />
                  ) : null}
                  {weakAndTypedTranslations.length > 0 ? (
                    <OptimisticallyStrengthen
                      metadataId={metadataId}
                      translations={weakAndTypedTranslations}
                    />
                  ) : null}
                  {props.renderDefault(props)}
                </Stack>
              )
            }

            return props.renderDefault(props)
          },
        },
      },

      // Adds:
      // - The `Translations` dropdown to the editing form
      // - `Badges` to documents with a language value
      // - The `DeleteMetadataAction` action to the metadata document type
      document: {
        unstable_languageFilter: (prev, ctx) => {
          const {schemaType, documentId} = ctx

          return schemaTypes.includes(schemaType) && documentId
            ? [
                ...prev,
                (props) =>
                  DocumentInternationalizationMenu({...props, documentId}),
              ]
            : prev
        },
        badges: (prev, {schemaType}) => {
          if (!schemaTypes.includes(schemaType)) {
            return prev
          }

          return [(props) => LanguageBadge(props), ...prev]
        },
        actions: (prev, {schemaType}) => {
          if (schemaType === METADATA_SCHEMA_NAME) {
            return [...prev, DeleteMetadataAction]
          }

          return prev
        },
      },

      // Adds:
      // - The `Translations metadata` document type to the schema
      schema: {
        // Create the metadata document type
        types: [metadata(schemaTypes, metadataFields)],

        // For every schema type this plugin is enabled on
        // Create an initial value template to set the language
        templates: (prev, {schema}) => {
          // Templates are not setup for async languages
          if (!Array.isArray(supportedLanguages)) {
            return prev
          }

          const parameterizedTemplates = schemaTypes.map((schemaType) => ({
            id: `${schemaType}-parameterized`,
            title: `${
              schema?.get(schemaType)?.title ?? schemaType
            }: with Language`,
            schemaType,
            parameters: [
              {name: `languageId`, title: `Language ID`, type: `string`},
            ],
            value: ({languageId}: {languageId: string}) => ({
              [languageField]: languageId,
            }),
          }))

          const staticTemplates = schemaTypes.flatMap((schemaType) => {
            return supportedLanguages.map((language) => ({
              id: `${schemaType}-${language.id}`,
              title: `${language.title} ${
                schema?.get(schemaType)?.title ?? schemaType
              }`,
              schemaType,
              value: {
                [languageField]: language.id,
              },
            }))
          })

          return [...prev, ...parameterizedTemplates, ...staticTemplates]
        },
      },

      // Uses:
      // - `sanity-plugin-internationalized-array` to maintain the translations array
      plugins: [
        // Translation metadata stores its references using this plugin
        // It cuts down on attribute usage and gives UI conveniences to add new translations
        internationalizedArray({
          languages: supportedLanguages,
          fieldTypes: [
            defineField(
              {
                name: 'reference',
                type: 'reference',
                to: schemaTypes.map((type) => ({type})),
                weak: pluginConfig.weakReferences,
                // Reference filters don't actually enforce validation!
                validation: (Rule) =>
                  // @ts-expect-error - fix typings
                  Rule.custom(async (item: TranslationReference, context) => {
                    if (!item?.value?._ref || !item?._key) {
                      return true
                    }

                    const client = context.getClient({apiVersion: API_VERSION})
                    const valueLanguage = await client.fetch(
                      `*[_id in [$ref, $draftRef]][0].${languageField}`,
                      {
                        ref: item.value._ref,
                        draftRef: `drafts.${item.value._ref}`,
                      }
                    )

                    if (valueLanguage && valueLanguage === item._key) {
                      return true
                    }

                    return `Referenced document does not have the correct language value`
                  }),
                options: {
                  // @ts-expect-error - Update type once it knows the values of this filter
                  filter: ({parent, document}) => {
                    if (!parent) return null

                    // I'm not sure in what instance there's an array of parents
                    // But the Type suggests it's possible
                    const parentArray = Array.isArray(parent)
                      ? parent
                      : [parent]
                    const language = parentArray.find((p) => p._key)

                    if (!language?._key) return null

                    if (document.schemaTypes) {
                      return {
                        filter: `_type in $schemaTypes && ${languageField} == $language`,
                        params: {
                          schemaTypes: document.schemaTypes,
                          language: language._key,
                        },
                      }
                    }

                    return {
                      filter: `${languageField} == $language`,
                      params: {language: language._key},
                    }
                  },
                },
              },
              {strict: false}
            ),
          ],
        }),
      ],
    }
  }
)
