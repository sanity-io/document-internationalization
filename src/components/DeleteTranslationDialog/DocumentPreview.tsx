import {Preview, useSchema} from 'sanity'
import {Feedback} from 'sanity-plugin-utils'

type DocumentPreviewProps = {
  value: unknown
  type: string
}

// Wrapper of Preview just so that the schema type is satisfied by schema.get()
export default function DocumentPreview(props: DocumentPreviewProps) {
  const schema = useSchema()

  const schemaType = schema.get(props.type)
  if (!schemaType) {
    return <Feedback tone="critical" title="Schema type not found" />
  }

  return <Preview value={props.value} schemaType={schemaType} />
}
