import compact from 'lodash/compact'
import {SanityClient, SanityDocument} from '@sanity/client'
import {ITranslationRef} from '../types'
import {ReferenceBehavior} from '../constants'
import {ApplyConfigResult} from '../utils'
import {getLanguagesFromOption} from './getLanguagesFromOption'
import {getBaseLanguage} from './getBaseLanguage'
import {getTranslationsFor} from './getTranslationsForId'
import {getBaseIdFromId} from './getBaseIdFromId'
import {createSanityReference} from './createSanityReference'
import {getLanguageFromDocument} from './getLanguageFromDocument'

// @TODO make this into a hook so the hook
// can look up the existance of a base document on its own
export async function updateIntlFieldsForDocument(
  client: SanityClient,
  config: ApplyConfigResult,
  document: SanityDocument,
  baseDocument?: SanityDocument
): Promise<void> {
  const {_type: type, _id: id} = document
  const baseDocumentId = getBaseIdFromId(id)
  const isTranslation = id !== baseDocumentId
  const fieldName = config.fieldNames.lang
  const refsFieldName = config.fieldNames.references
  const baseRefFieldName = config.fieldNames.baseReference
  const langs = await getLanguagesFromOption(client, config, config.languages, document)
  const languageId =
    getLanguageFromDocument(document, config) || getBaseLanguage(langs, config.base)?.id

  // Update I18n field for current document
  const currentDocumentTransaction = client.transaction()
  currentDocumentTransaction.createIfNotExists({_id: id, _type: type})
  currentDocumentTransaction.patch(id, {
    set: {
      [fieldName]: languageId,
      ...(isTranslation && config.referenceBehavior !== ReferenceBehavior.DISABLED
        ? {
            [baseRefFieldName]: createSanityReference(
              baseDocumentId,
              config.referenceBehavior === ReferenceBehavior.WEAK
            ),
          }
        : {}),
    },
  })
  await currentDocumentTransaction.commit()

  // update base document reference if required
  if (baseDocument) {
    const translatedDocuments = await getTranslationsFor(client, config, baseDocumentId)
    if (translatedDocuments.length > 0) {
      const baseDocumentTransaction = client.transaction()
      let translatedRefs: ITranslationRef[] = []
      if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
        translatedRefs = compact(
          translatedDocuments.map((doc) => {
            const lang = getLanguageFromDocument(doc, config)
            if (!lang) return null
            return {
              _key: lang,
              ...createSanityReference(
                doc._id,
                config.referenceBehavior === ReferenceBehavior.WEAK
              ),
            }
          }, {})
        )
      }
      // baseDocumentTransaction.createIfNotExists({_id: baseDocumentId, _type: type})
      baseDocumentTransaction.patch(baseDocumentId, {
        set: {
          [refsFieldName]: translatedRefs,
        },
      })
      await baseDocumentTransaction.commit()
    }
  }
}
