import {Ti18nDocument} from '../../types'
import {getConfig, getSanityClient} from '../../utils'

export const fixBaseLanguageMismatch = async (schema: string, basedocuments: Ti18nDocument[]) => {
  const sanityClient = getSanityClient()
  const config = getConfig(schema)
  const langFieldName = config.fieldNames.lang
  const transaction = sanityClient.transaction()
  basedocuments.forEach((doc) => {
    if (doc[langFieldName] !== config.base) {
      transaction.patch(doc._id, {
        set: {[langFieldName]: config.base}, // eslint-disable-line
      })
    }
  })
  await transaction.commit()
}
