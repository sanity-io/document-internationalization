import React, {useCallback, useState} from 'react'
import {Stack, Box, Container, Dialog, Button, Flex, Grid, Text, Card, Code} from '@sanity/ui'
import {Transaction} from '@sanity/client'
import styled from 'styled-components'
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
import {UiMessages} from '../../../constants'

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

export const MaintenanceTabContent = () => {
  const [selectedSchema, setSelectedSchema] = React.useState('')
  const {
    pending,
    setPending,
    documents,
    baseDocuments,
    translatedDocuments,
    documentsSummaryInformation,
    fetchInformation,
  } = useDocumentsInformation(selectedSchema)
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[] | null>(null)

  const onSchemaTypeChange = useCallback((schemaName: string) => setSelectedSchema(schemaName), [])

  const handleOpen = useCallback(() => setSelectedSchema(''), [])

  const handleFixIdStructureMismatchDocuments = useCallback(() => {
    setPendingTransactions(fixIdStructureMismatchDocuments(selectedSchema, documents))
  }, [selectedSchema, documents])

  const handleFixMissingLanguageFields = useCallback(() => {
    setPendingTransactions([fixLanguageFields(selectedSchema, documents)])
  }, [selectedSchema, documents])

  const handleFixTranslationRefs = useCallback(() => {
    setPendingTransactions(fixTranslationRefs(selectedSchema, baseDocuments, translatedDocuments))
  }, [selectedSchema, baseDocuments, translatedDocuments])

  const handleFixBaseDocumntRefs = useCallback(() => {
    setPendingTransactions([fixBaseDocumentRefs(selectedSchema, translatedDocuments)])
  }, [selectedSchema, translatedDocuments])

  const handleFixOrphanDocuments = useCallback(() => {
    setPendingTransactions([fixOrphanedDocuments(baseDocuments, translatedDocuments)])
  }, [baseDocuments, translatedDocuments])

  const handleFixReferenceBehaviorMismatch = useCallback(() => {
    setPendingTransactions(fixTranslationRefs(selectedSchema, baseDocuments, translatedDocuments))
  }, [selectedSchema, baseDocuments, translatedDocuments])

  const handleFixBaseLanguageMismatch = useCallback(async () => {
    setPendingTransactions([await fixBaseLanguageMismatch(selectedSchema, baseDocuments)])
  }, [selectedSchema, baseDocuments])

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
}
