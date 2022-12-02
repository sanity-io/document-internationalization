import {useCallback, useEffect, useState} from 'react'
import {Language, SupportedLanguagesConfig} from '../types'

export function useLanguages(config: SupportedLanguagesConfig): [boolean, Language[]] {
  const [pending, setPending] = useState(false)
  const [languages, setLanguages] = useState<Language[]>([])

  const updateLanguages = useCallback(async (input: SupportedLanguagesConfig) => {
    if (Array.isArray(input)) {
      setLanguages(input)
    } else {
      try {
        setPending(true)
        const result = await input()
        setLanguages(result)
        setPending(false)
      } catch (err) {
        setPending(false)
        throw err
      }
    }
  }, [])

  useEffect(() => {
    updateLanguages(config)
  }, [config, updateLanguages])

  return [pending, languages]
}
