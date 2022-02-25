import {SanityDocument} from '@sanity/client'
import {useEditState} from '@sanity/react-hooks'
import shouldReloadFn from 'part:@sanity/document-internationalization/languages/should-reload?'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {ILanguageObject} from '../../types'
import {getConfig, getLanguagesFromOption} from '../../utils'

export function useLanguages(document: SanityDocument): [boolean, ILanguageObject[]] {
  const config = useMemo(() => getConfig(document._type), [document._type])
  const {draft, published} = useEditState(document._id.replace(/^drafts\./, ''), document._type)
  const [pending, setPending] = useState(false)
  const [languages, setLanguages] = useState<ILanguageObject[]>([])

  const loadOrReloadLanguages = useCallback(async () => {
    const shouldReload =
      languages.length === 0 || (shouldReloadFn && shouldReloadFn(draft ?? published))
    if (shouldReload) {
      setPending(true)
      const languageObjects = await getLanguagesFromOption(config.languages, draft ?? published)
      setLanguages(languageObjects)
      setPending(false)
    }
  }, [draft, published, config, languages])

  useEffect(() => {
    loadOrReloadLanguages()
  }, [draft, published, languages, config, loadOrReloadLanguages])

  return [pending, languages]
}
