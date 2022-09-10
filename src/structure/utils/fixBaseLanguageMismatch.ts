import type {SanityDocument, SanityClient, Transaction} from '@sanity/client'
import {ApplyConfigResult, getBaseLanguage, getLanguagesFromOption} from '../../utils'

export const fixBaseLanguageMismatch = async (
  sanityClient: SanityClient,
  config: ApplyConfigResult,
  basedocuments: SanityDocument[]
): Promise<Transaction> => {
  const languages = await getLanguagesFromOption(sanityClient, config, config.languages)
  const baseLanguage = getBaseLanguage(languages, config.base)
  const langFieldName = config.fieldNames.lang
  const transaction = sanityClient.transaction()
  basedocuments.forEach((doc) => {
    if (doc[langFieldName] !== baseLanguage?.id) {
      transaction.patch(doc._id, {
        set: {[langFieldName]: baseLanguage?.id}, // eslint-disable-line
      })
    }
  })
  return transaction
}
