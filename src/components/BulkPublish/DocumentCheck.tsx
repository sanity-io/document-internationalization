import {Card, Spinner} from '@sanity/ui'
import {useEffect, useMemo} from 'react'
import {Preview, useEditState, useSchema, useValidationStatus} from 'sanity'

type DocumentCheckProps = {
  id: string
  onCheckComplete: (id: string) => void
  addInvalidId: (id: string) => void
  removeInvalidId: (id: string) => void
  addDraftId: (id: string) => void
  removeDraftId: (id: string) => void
}

// Check if the document has a draft
// Check if that draft is valid
// Report back to parent that it can be added to bulk publish
export default function DocumentCheck(props: DocumentCheckProps) {
  const {
    id,
    onCheckComplete,
    addInvalidId,
    removeInvalidId,
    addDraftId,
    removeDraftId,
  } = props
  const editState = useEditState(id, ``)
  const {isValidating, validation} = useValidationStatus(id, ``)
  const schema = useSchema()

  const validationHasErrors = useMemo(() => {
    return (
      !isValidating &&
      validation.length > 0 &&
      validation.some((item) => item.level === 'error')
    )
  }, [isValidating, validation])

  useEffect(() => {
    if (validationHasErrors) {
      addInvalidId(id)
    } else {
      removeInvalidId(id)
    }

    if (editState.draft) {
      addDraftId(id)
    } else {
      removeDraftId(id)
    }

    if (!isValidating) {
      onCheckComplete(id)
    }
  }, [
    addDraftId,
    addInvalidId,
    editState.draft,
    id,
    isValidating,
    onCheckComplete,
    removeDraftId,
    removeInvalidId,
    validationHasErrors,
  ])

  // We only care about drafts
  if (!editState.draft) {
    return null
  }

  const schemaType = schema.get(editState.draft._type)

  return (
    <Card
      border
      padding={2}
      tone={validationHasErrors ? `critical` : `positive`}
    >
      {editState.draft && schemaType ? (
        <Preview
          layout="default"
          value={editState.draft}
          schemaType={schemaType}
        />
      ) : (
        <Spinner />
      )}
    </Card>
  )
}
