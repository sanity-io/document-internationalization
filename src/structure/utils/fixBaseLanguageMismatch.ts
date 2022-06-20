import {SanityClient} from '@sanity/client'
import {Ti18nDocument} from '../../types'
import {ApplyConfigResult, getBaseLanguage, getLanguagesFromOption} from '../../utils'

export const fixBaseLanguageMismatch = async (
  sanityClient: SanityClient,
  config: ApplyConfigResult,
  basedocuments: Ti18nDocument[]
): Promise<void> => {
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
  await transaction.commit()
}
