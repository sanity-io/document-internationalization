import {CogIcon} from '@sanity/icons'
import {Box, Button, Stack, Text, Tooltip} from '@sanity/ui'
import {useCallback, useState} from 'react'
import {type ObjectSchemaType, useClient} from 'sanity'

import {METADATA_SCHEMA_NAME} from '../constants'
import {useOpenInNewPane} from '../hooks/useOpenInNewPane'
import {createReference} from '../utils/createReference'
import {useDocumentInternationalizationContext} from './DocumentInternationalizationContext'

type LanguageManageProps = {
  id?: string
  metadataId?: string | null
  schemaType: ObjectSchemaType
  documentId: string
  sourceLanguageId?: string
}

export default function LanguageManage(props: LanguageManageProps) {
  const {id, metadataId, schemaType, documentId, sourceLanguageId} = props
  const open = useOpenInNewPane(id, METADATA_SCHEMA_NAME)
  const openCreated = useOpenInNewPane(metadataId, METADATA_SCHEMA_NAME)
  const {allowCreateMetaDoc, apiVersion, weakReferences} =
    useDocumentInternationalizationContext()
  const client = useClient({apiVersion})
  const [userHasClicked, setUserHasClicked] = useState(false)

  const canCreate = !id && Boolean(metadataId) && allowCreateMetaDoc

  const handleClick = useCallback(() => {
    if (!id && metadataId && sourceLanguageId) {
      /* Disable button while this request is pending */
      setUserHasClicked(true)

      // handle creation of meta document
      const transaction = client.transaction()

      const sourceReference = createReference(
        sourceLanguageId,
        documentId,
        schemaType.name,
        !weakReferences
      )
      const newMetadataDocument = {
        _id: metadataId,
        _type: METADATA_SCHEMA_NAME,
        schemaTypes: [schemaType.name],
        translations: [sourceReference],
      }

      transaction.createIfNotExists(newMetadataDocument)

      transaction
        .commit()
        .then(() => {
          setUserHasClicked(false)
          openCreated()
        })
        .catch((err) => {
          console.error(err)
          setUserHasClicked(false)
        })
    } else {
      open()
    }
  }, [
    id,
    metadataId,
    sourceLanguageId,
    client,
    documentId,
    schemaType.name,
    weakReferences,
    openCreated,
    open,
  ])

  const disabled =
    (!id && !canCreate) || (canCreate && !sourceLanguageId) || userHasClicked

  return (
    <Tooltip
      animate
      content={
        <Box padding={2}>
          <Text muted size={1}>
            Document has no other translations
          </Text>
        </Box>
      }
      fallbackPlacements={['right', 'left']}
      placement="top"
      portal
      disabled={Boolean(id) || canCreate}
    >
      <Stack>
        <Button
          disabled={disabled}
          mode="ghost"
          text="Manage Translations"
          icon={CogIcon}
          loading={userHasClicked}
          onClick={handleClick}
        />
      </Stack>
    </Tooltip>
  )
}
