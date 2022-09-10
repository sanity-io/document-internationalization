import React, {forwardRef, Ref, useCallback, useState} from 'react'
import {useSchema} from 'sanity'
import {Box, Button, Card, Code, Container, Dialog, Flex, Grid, Stack, Text} from '@sanity/ui'
import {Transaction} from '@sanity/client'
import styled from 'styled-components'
import {UiMessages} from '../../../constants'
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

const StyledCodeCard = styled(Card)`
  grid-column-start: 1;
  grid-row-start: 1;
`

const StyledCode = styled(Code)`
  word-break: break-word;
  white-space: break-spaces;
`

const StyledDownloadCodeFlex = styled(Flex)`
  grid-column-start: 1;
  grid-row-start: 1;
`

export interface MaintenanceTabContentProps {
  config: Ti18nConfig
}

export const MaintenanceTabContent = forwardRef(function MaintenanceTabContent(
  {config: pluginConfig}: MaintenanceTabContentProps,
  ref: Ref<HTMLInputElement>
) {
  const [selectedSchema, setSelectedSchema] = useState('')
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
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[] | null>(null)
  const schemaRegistry = useSchema()
  const config = useConfig(pluginConfig, selectedSchema)

  const onSchemaTypeChange = useCallback((schemaName: string) => setSelectedSchema(schemaName), [])

  const handleOpen = useCallback(() => setSelectedSchema(''), [])

  const handleFixIdStructureMismatchDocuments = useCallback(() => {
    setPendingTransactions(
      fixIdStructureMismatchDocuments(client, config, selectedSchema, documents)
    )
  }, [client, config, selectedSchema, documents])

  const handleFixMissingLanguageFields = useCallback(() => {
    setPendingTransactions([fixLanguageFields(client, config, schemaRegistry, documents)])
  }, [client, schemaRegistry, config, documents])

  const handleFixTranslationRefs = useCallback(() => {
    setPendingTransactions(fixTranslationRefs(client, config, baseDocuments, translatedDocuments))
  }, [client, config, baseDocuments, translatedDocuments])

  const handleFixBaseDocumntRefs = useCallback(() => {
    setPendingTransactions([fixBaseDocumentRefs(client, config, translatedDocuments)])
  }, [client, config, translatedDocuments])

  const handleFixOrphanDocuments = useCallback(() => {
    setPendingTransactions([
      fixOrphanedDocuments(client, config, baseDocuments, translatedDocuments),
    ])
  }, [client, config, baseDocuments, translatedDocuments])

  const handleFixReferenceBehaviorMismatch = useCallback(() => {
    setPendingTransactions(fixTranslationRefs(client, config, baseDocuments, translatedDocuments))
  }, [client, config, baseDocuments, translatedDocuments])

  const handleFixBaseLanguageMismatch = useCallback(async () => {
    setPendingTransactions([await fixBaseLanguageMismatch(client, config, baseDocuments)])
  }, [client, config, baseDocuments])

  const handleDownloadCode = useCallback(() => {
    if (pendingTransactions) {
      const json = JSON.stringify(
        pendingTransactions.map((transaction) => transaction.toJSON()),
        null,
        2
      )
      const blob = new Blob([json], {
        type: 'application/json',
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transactions.json'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [pendingTransactions])

  const handleCancelPendingTransaction = useCallback(() => {
    setPendingTransactions(null)
  }, [setPendingTransactions])

  const handleConfirmPendingTransaction = useCallback(async () => {
    setPending(true)
    try {
      // run all transactions
      if (pendingTransactions) {
        await pendingTransactions.reduce<Promise<void>>(async (prev, transaction) => {
          await prev
          await transaction.commit()
        }, Promise.resolve())
        await fetchInformation(selectedSchema)
        setPendingTransactions(null)
      }
    } catch (err) {
      console.error(err)
      // @TODO show error
    } finally {
      setPending(false)
    }
  }, [setPending, fetchInformation, selectedSchema, pendingTransactions])

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
                onClick={handleFixIdStructureMismatchDocuments}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.missingLanguageField.length}
                labelName="missingLanguageField"
                onClick={handleFixMissingLanguageFields}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.missingDocumentRefs.length}
                labelName="missingDocumentRefs"
                onClick={handleFixTranslationRefs}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.missingBaseDocumentRefs.length}
                labelName="missingBaseDocumentRefs"
                onClick={handleFixBaseDocumntRefs}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.orphanDocuments.length}
                labelName="orphanDocuments"
                onClick={handleFixOrphanDocuments}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.referenceBehaviorMismatch.length}
                labelName="referenceBehaviorMismatch"
                onClick={handleFixReferenceBehaviorMismatch}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.baseLanguageMismatch.length}
                labelName="baseLanguageMismatch"
                onClick={handleFixBaseLanguageMismatch}
              />
            </Stack>
          </Box>
        )}
      </Stack>
      {!!pendingTransactions?.length && (
        <Dialog
          id="confirm-pending-transactions"
          width={2}
          header={UiMessages.translationsMaintenance.pendingTransactionDialog.header}
          onClose={handleCancelPendingTransaction}
          footer={
            <Flex padding={3} justify="flex-end">
              <Grid autoFlow="column" autoCols="auto" gap={2}>
                <Button
                  tone="default"
                  loading={pending}
                  disabled={pending}
                  text={UiMessages.translationsMaintenance.pendingTransactionDialog.cancel}
                  onClick={handleCancelPendingTransaction}
                />
                <Button
                  tone="critical"
                  loading={pending}
                  disabled={pending}
                  text={UiMessages.translationsMaintenance.pendingTransactionDialog.confirm}
                  onClick={handleConfirmPendingTransaction}
                />
              </Grid>
            </Flex>
          }
        >
          <Stack padding={3} space={3}>
            <Card padding={3} radius={2} shadow={1} tone="caution">
              <Text size={2}>
                {UiMessages.translationsMaintenance.pendingTransactionDialog.caution}
              </Text>
            </Card>
            <Grid cols={1}>
              <StyledCodeCard padding={3} radius={2} shadow={1} tone="default">
                <StyledCode language="json">
                  {JSON.stringify(
                    pendingTransactions.map((transaction) => transaction.toJSON()),
                    null,
                    2
                  )}
                </StyledCode>
              </StyledCodeCard>
              <StyledDownloadCodeFlex
                padding={2}
                justify="flex-end"
                align="flex-start"
                onClick={handleDownloadCode}
              >
                <Button text="Download" />
              </StyledDownloadCodeFlex>
            </Grid>
          </Stack>
        </Dialog>
      )}
    </Container>
  )
})
