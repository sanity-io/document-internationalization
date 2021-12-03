import React from 'react'
import {I18nDelimiter, I18nPrefix, IdStructure, ReferenceBehavior} from '../../constants'
import {ITranslationRef, Ti18nDocument} from '../../types'
import {getBaseIdFromId, getConfig, getSanityClient} from '../../utils'

export const useDocumentsInformation = (schema: string) => {
  const config = getConfig()
  const sanityClientRef = React.useRef(getSanityClient())
  const [pending, setPending] = React.useState(false)
  const [documents, setDocuments] = React.useState<Ti18nDocument[]>([])
  const baseDocuments = React.useMemo(() => {
    if (config.idStructure === IdStructure.DELIMITER)
      return documents.filter((d) => !d._id.includes(I18nDelimiter))
    return documents.filter((d) => !d._id.startsWith(I18nPrefix))
  }, [documents])
  const translatedDocuments = React.useMemo(() => {
    if (config.idStructure === IdStructure.DELIMITER)
      return documents.filter((d) => d._id.includes(I18nDelimiter))
    return documents.filter((d) => d._id.startsWith(I18nPrefix))
  }, [documents])
  const idStructureMismatchDocuments = React.useMemo(() => {
    if (config.idStructure === IdStructure.DELIMITER)
      return documents.filter((d) => d._id.startsWith(I18nPrefix))
    return documents.filter((d) => d._id.includes(I18nDelimiter))
  }, [documents])

  const fetchInformation = React.useCallback(
    async (selectedSchema: string) => {
      setPending(true)
      const result = await sanityClientRef.current.fetch<Ti18nDocument[]>(
        `*[_type == $type && !(_id in path('drafts.**'))]`,
        {type: selectedSchema}
      )
      setDocuments(result)
      setPending(false)
    },
    [pending, documents, sanityClientRef.current]
  )

  const documentsSummaryInformation = React.useMemo(() => {
    const cfg = getConfig(schema)
    const basedocuments = baseDocuments
    const translateddocuments = translatedDocuments
    const langFieldName = cfg.fieldNames?.lang
    const refsFieldName = cfg.fieldNames?.references
    const baseRefFieldName = cfg.fieldNames?.baseReference
    return {
      idStructureMismatch: idStructureMismatchDocuments,
      missingLanguageField: documents.filter((d) => !d[langFieldName]),
      missingDocumentRefs: basedocuments.filter((d) => {
        const docs = translateddocuments.filter((dx) => getBaseIdFromId(dx._id) === d._id)
        const refsCount = Object.keys(d[refsFieldName] || {}).length
        return refsCount != docs.length
      }),
      missingBaseDocumentRefs: documents.filter((d) => !d[baseRefFieldName]),
      orphanDocuments: translateddocuments.filter((d) => {
        const base = basedocuments.find((doc) => getBaseIdFromId(d._id) === doc._id)
        if (base) return false
        return true
      }),
      referenceBehaviorMismatch: basedocuments.filter((doc) => {
        const refs: Record<string, ITranslationRef> = doc[refsFieldName] || {}
        if (cfg.referenceBehavior === ReferenceBehavior.DISABLED)
          return Object.keys(refs).length > 0
        if (cfg.referenceBehavior === ReferenceBehavior.WEAK)
          return Object.values(refs).some((r) => !r.ref._weak)
        return Object.values(refs).some((r) => !!r.ref._weak)
      }),
      baseLanguageMismatch: basedocuments.filter((doc) => {
        return doc.__i18n_lang !== cfg.base
      }),
    }
  }, [documents, schema, baseDocuments, translatedDocuments, idStructureMismatchDocuments])

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
