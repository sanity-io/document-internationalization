import type {SanityDocument} from '@sanity/client'
import React from 'react'
import {I18nDelimiter, I18nPrefix, IdStructure, ReferenceBehavior} from '../../constants'
import {ILanguageObject, ITranslationRef} from '../../types'
import {
  getBaseIdFromId,
  getBaseLanguage,
  getConfig,
  getLanguagesFromOption,
  getSanityClient,
} from '../../utils'

export const useDocumentsInformation = (schema: string) => {
  const config = React.useMemo(() => getConfig(schema), [schema])
  const sanityClientRef = React.useRef(getSanityClient())
  const [pending, setPending] = React.useState(false)
  const [documents, setDocuments] = React.useState<SanityDocument[]>([])
  const [languages, setLanguages] = React.useState<ILanguageObject[]>([])
  const baseDocuments = React.useMemo(() => {
    if (config.idStructure === IdStructure.DELIMITER)
      return documents.filter((d) => !d._id.includes(I18nDelimiter))
    return documents.filter((d) => !d._id.startsWith(I18nPrefix))
  }, [config, documents])
  const translatedDocuments = React.useMemo(() => {
    if (config.idStructure === IdStructure.DELIMITER)
      return documents.filter((d) => d._id.includes(I18nDelimiter))
    return documents.filter((d) => d._id.startsWith(I18nPrefix))
  }, [config, documents])
  const idStructureMismatchDocuments = React.useMemo(() => {
    if (config.idStructure === IdStructure.DELIMITER)
      return documents.filter((d) => d._id.startsWith(I18nPrefix))
    return documents.filter((d) => d._id.includes(I18nDelimiter))
  }, [config, documents])

  const fetchInformation = React.useCallback(
    async (selectedSchema: string) => {
      setPending(true)
      const [langs, result] = await Promise.all([
        getLanguagesFromOption(config.languages),
        sanityClientRef.current.fetch<SanityDocument[]>(
          `*[_type == $type && !(_id in path('drafts.**'))]{
            _id,
            _type,
            ${config.fieldNames.lang},
            ${config.fieldNames.references},
            ${config.fieldNames.baseReference}
          }`,
          {type: selectedSchema}
        ),
      ])
      setLanguages(langs)
      setDocuments(result)
      setPending(false)
    },
    [pending, config, documents, sanityClientRef.current]
  )

  const documentsSummaryInformation = React.useMemo(() => {
    const base = getBaseLanguage(languages, config.base)
    const basedocuments = baseDocuments
    const translateddocuments = translatedDocuments
    const langFieldName = config.fieldNames?.lang
    const refsFieldName = config.fieldNames?.references
    const baseRefFieldName = config.fieldNames?.baseReference
    return {
      idStructureMismatch: idStructureMismatchDocuments,
      missingLanguageField: documents.filter((d) => !d[langFieldName]),
      missingDocumentRefs: basedocuments.filter((d) => {
        const docs = translateddocuments.filter((dx) => getBaseIdFromId(dx._id) === d._id)
        const refsCount = (Object.values(d[refsFieldName] || []) as any[]).filter(
          (ref) => ref._type === 'reference' && !!ref._ref
        ).length
        return refsCount != docs.length
      }),
      missingBaseDocumentRefs: translateddocuments.filter((d) => !d[baseRefFieldName]),
      orphanDocuments: translateddocuments.filter((d) => {
        const baseDoc = basedocuments.find((doc) => getBaseIdFromId(d._id) === doc._id)
        if (baseDoc) return false
        return true
      }),
      referenceBehaviorMismatch: basedocuments.filter((doc) => {
        const refs: ITranslationRef[] = doc[refsFieldName] || []
        if (config.referenceBehavior === ReferenceBehavior.DISABLED)
          return Object.keys(refs).length > 0
        if (config.referenceBehavior === ReferenceBehavior.WEAK)
          return Object.values(refs).some((r) => !r._weak)
        return Object.values(refs).some((r) => !!r._weak)
      }),
      baseLanguageMismatch: basedocuments.filter((doc) => {
        return base?.id && doc[langFieldName] !== base.id
      }),
    }
  }, [
    config,
    documents,
    languages,
    baseDocuments,
    translatedDocuments,
    idStructureMismatchDocuments,
  ])

  React.useEffect(() => {
    if (schema) {
      fetchInformation(schema)
    }
  }, [schema])

  return {
    pending,
    setPending,
    documents,
    baseDocuments,
    translatedDocuments,
    idStructureMismatchDocuments,
    documentsSummaryInformation,
    fetchInformation,
  }
}
