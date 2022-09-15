import React from 'react'
import {createPlugin, defineField} from 'sanity'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'

import metadata from './schema/translation/metadata'
import MenuButton from './MenuButton'
import {PluginConfig} from './types'
import {LanguageBadge} from './badges'

const DEFAULT_CONFIG = {
  supportedLanguages: [],
  schemaTypes: [],
  languageField: `language`,
}

export const documentInternationalization = createPlugin<PluginConfig>((config) => {
  const {supportedLanguages, schemaTypes, languageField} = {...DEFAULT_CONFIG, ...config}

  const renderLanguageFilter = (schemaType: string, documentId?: string) => {
    return (
      <MenuButton
        supportedLanguages={supportedLanguages}
        schemaType={schemaType}
        documentId={documentId ?? ``}
        languageField={languageField}
      />
    )
  }

  return {
    name: '@sanity/document-internationalization',
    document: {
      unstable_languageFilter: (prev, ctx) => {
        const {schemaType, documentId} = ctx

        // TODO: Memoize this function
        return schemaTypes.includes(schemaType)
          ? [...prev, () => renderLanguageFilter(schemaType, documentId)]
          : prev
      },
      badges: (prev, context) => {
        if (!schemaTypes.includes(context.schemaType)) {
          return prev
        }

        return [(props) => LanguageBadge(props, supportedLanguages, languageField), ...prev]
      },
    },
    schema: {
      // Create the metadata document type
      types: [metadata(schemaTypes)],

      // For every schema type this plugin is enabled on
      // Create an initial value template to set the language
      templates: (prev, {schema}) => {
        const parameterizedTemplates = schemaTypes.map((schemaType) => ({
          id: `${schemaType}-parameterized`,
          title: `${schema?.get(schemaType)?.title ?? schemaType}: with Language`,
          schemaType,
          parameters: [{name: `languageId`, title: `Language ID`, type: `string`}],
          value: ({languageId}: {languageId: string}) => ({
            [languageField]: languageId,
          }),
        }))

        const staticTemplates = schemaTypes.flatMap((schemaType) => {
          return supportedLanguages.map((language) => ({
            id: `${schemaType}-${language.id}`,
            title: `${language.title} Lesson`,
            schemaType,
            value: {
              [languageField]: language.id,
            },
          }))
        })

        return [...prev, ...parameterizedTemplates, ...staticTemplates]
      },
    },
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
              to: schemaTypes.map((type) => ({type: type})),
              options: {
                collapsed: false,
                // TODO: Update type once it knows the values of this filter
                // @ts-ignore
                filter: ({parent, document}) => {
                  if (!parent?._key) {
                    return null
                  }

                  const language = parent._key
                  const {schemaType} = document

                  if (schemaType) {
                    return {
                      filter: `_type == $schemaType && ${languageField} == $language`,
                      params: {schemaType, language},
                    }
                  }

                  return {
                    filter: `${languageField} == $language`,
                    params: {language},
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
})
