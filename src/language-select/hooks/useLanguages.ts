import {SanityDocument} from '@sanity/client'
import {useCallback, useEffect, useState} from 'react'
import {useEditState} from 'sanity'
import {ILanguageObject} from '../../types'
import {getLanguagesFromOption, useSanityClient, ApplyConfigResult} from '../../utils'

export function useLanguages(
  config: ApplyConfigResult,
  document: SanityDocument
): [boolean, ILanguageObject[]] {
  const client = useSanityClient()
  const {draft, published} = useEditState(document._id.replace(/^drafts\./, ''), document._type)
  const [pending, setPending] = useState(false)
  const [languages, setLanguages] = useState<ILanguageObject[]>([])

  const loadOrReloadLanguages = useCallback(async () => {
    const shouldReload =
      languages.length === 0 || (config.shouldReload && config.shouldReload(draft ?? published))
    if (shouldReload) {
      setPending(true)
      const languageObjects = await getLanguagesFromOption(
        client,
        config,
        config.languages,
        draft ?? published
      )
      setLanguages(languageObjects)
      setPending(false)
    }
  }, [client, config, draft, published, languages])

  useEffect(() => {
    loadOrReloadLanguages()
  }, [draft, published, languages, config, loadOrReloadLanguages])

  return [pending, languages]
}
