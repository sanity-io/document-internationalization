import React, {forwardRef, Ref} from 'react'
import {useSchema} from 'sanity'
import {Box, Container, Stack} from '@sanity/ui'
import {MaintenanceTabTypeSelector} from '../MaintenanceTabTypeSelector'
import {useDocumentsInformation} from '../../hooks'
import {MaintenanceTabResult} from '../MaintenanceTabResult'
import {
  fixBaseDocumentRefs,
  fixBaseLanguageMismatch,
  fixIdStructureMismatchDocuments,
  fixLanguageFields,
  fixOrphanedDocuments,
  fixTranslationRefs,
} from '../../utils'
import {Ti18nConfig} from '../../../types'
import {useSanityClient} from '../../../utils'
import {useConfig} from '../../../hooks'

export interface MaintenanceTabContentProps {
  config: Ti18nConfig
}

export const MaintenanceTabContent = forwardRef(function MaintenanceTabContent(
  {config: pluginConfig}: MaintenanceTabContentProps,
  ref: Ref<HTMLInputElement>
) {
  const [selectedSchema, setSelectedSchema] = React.useState('')
  const client = useSanityClient()
  const {
    pending,
    setPending,
    documents,
    baseDocuments,
    translatedDocuments,
    documentsSummaryInformation,
    fetchInformation,
  } = useDocumentsInformation(pluginConfig, selectedSchema)
  const schemaRegistry = useSchema()
  const config = useConfig(pluginConfig, selectedSchema)

  const onSchemaTypeChange = React.useCallback(
    (schemaName: string) => setSelectedSchema(schemaName),
    []
  )

  const handleOpen = React.useCallback(() => setSelectedSchema(''), [])

  const onFixIdStructureMismatchDocuments = React.useCallback(async () => {
    setPending(true)
    await fixIdStructureMismatchDocuments(client, config, selectedSchema, documents)
    await fetchInformation(selectedSchema)
  }, [setPending, client, config, selectedSchema, documents, fetchInformation])

  const onFixMissingLanguageFields = React.useCallback(async () => {
    setPending(true)
    await fixLanguageFields(client, config, schemaRegistry, documents)
    await fetchInformation(selectedSchema)
  }, [setPending, client, schemaRegistry, config, selectedSchema, documents, fetchInformation])

  const onFixTranslationRefs = React.useCallback(async () => {
    setPending(true)
    await fixTranslationRefs(client, config, baseDocuments, translatedDocuments)
    await fetchInformation(selectedSchema)
  }, [
    setPending,
    client,
    config,
    selectedSchema,
    baseDocuments,
    translatedDocuments,
    fetchInformation,
  ])

  const onFixBaseDocumntRefs = React.useCallback(async () => {
    setPending(true)
    await fixBaseDocumentRefs(client, config, translatedDocuments)
    await fetchInformation(selectedSchema)
  }, [setPending, fetchInformation, client, config, selectedSchema, translatedDocuments])

  const onFixOrphanDocuments = React.useCallback(async () => {
    setPending(true)
    await fixOrphanedDocuments(client, baseDocuments, translatedDocuments)
    await fetchInformation(selectedSchema)
  }, [setPending, client, selectedSchema, baseDocuments, translatedDocuments, fetchInformation])

  const onFixReferenceBehaviorMismatch = React.useCallback(async () => {
    setPending(true)
    await fixTranslationRefs(client, config, baseDocuments, translatedDocuments)
    await fetchInformation(selectedSchema)
  }, [
    setPending,
    fetchInformation,
    client,
    config,
    selectedSchema,
    baseDocuments,
    translatedDocuments,
  ])

  const onFixBaseLanguageMismatch = React.useCallback(async () => {
    setPending(true)
    await fixBaseLanguageMismatch(client, config, baseDocuments)
    await fetchInformation(selectedSchema)
  }, [setPending, client, config, selectedSchema, baseDocuments, fetchInformation])

  return (
    <Container width={1}>
      <Stack space={2}>
        <Box padding={4}>
          <MaintenanceTabTypeSelector
            value={selectedSchema}
            onChange={onSchemaTypeChange}
            onOpen={handleOpen}
            ref={ref}
          />
        </Box>
        {!!selectedSchema && (
          <Box paddingX={4}>
            <Stack space={2}>
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.idStructureMismatch.length}
                labelName="idStructureMismatch"
                onClick={onFixIdStructureMismatchDocuments}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.missingLanguageField.length}
                labelName="missingLanguageField"
                onClick={onFixMissingLanguageFields}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.missingDocumentRefs.length}
                labelName="missingDocumentRefs"
                onClick={onFixTranslationRefs}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.missingBaseDocumentRefs.length}
                labelName="missingBaseDocumentRefs"
                onClick={onFixBaseDocumntRefs}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.orphanDocuments.length}
                labelName="orphanDocuments"
                onClick={onFixOrphanDocuments}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.referenceBehaviorMismatch.length}
                labelName="referenceBehaviorMismatch"
                onClick={onFixReferenceBehaviorMismatch}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.baseLanguageMismatch.length}
                labelName="baseLanguageMismatch"
                onClick={onFixBaseLanguageMismatch}
              />
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  )
})
