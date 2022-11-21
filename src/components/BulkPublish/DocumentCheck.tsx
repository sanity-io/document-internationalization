import React from 'react'
import {Card, Spinner} from '@sanity/ui'
import {
  useEditState,
  useValidationStatus,
  SanityPreview as Preview,
  SchemaType,
  useSchema,
} from 'sanity'

type DocumentCheckProps = {
  id: string
  addId: (id: string) => void
  removeId: (id: string) => void
}

// Check if the document has a draft
// Check if that draft is valid
// Report back to parent that it can be added to bulk publish
export default function DocumentCheck(props: DocumentCheckProps) {
  const {id, addId, removeId} = props
  const editState = useEditState(id, ``)
  const validationStatus = useValidationStatus(id, ``)
  const schema = useSchema()

  const validationHasErrors = React.useMemo(() => {
    return (
      validationStatus.validation.length > 0 &&
      validationStatus.validation.find((item) => item.level === 'error')
    )
  }, [validationStatus])

  React.useEffect(() => {
    if (validationHasErrors) {
      addId(id)
    } else {
      removeId(id)
    }
  }, [addId, id, removeId, validationHasErrors])

  // We only care about drafts
  if (!editState.draft) {
    return null
  }

  return (
    <Card border padding={2} tone={validationHasErrors ? `critical` : `positive`}>
      {editState.published ? (
        <Preview
          layout="default"
          value={editState.published}
          schemaType={schema.get(editState.published._type) as SchemaType}
        />
      ) : (
        <Spinner />
      )}
    </Card>
  )
}
