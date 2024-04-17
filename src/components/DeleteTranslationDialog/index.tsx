import {Card, Flex, Spinner, Stack, Text} from '@sanity/ui'
import {useEffect, useMemo} from 'react'
import type {SanityDocument} from 'sanity'
import {useListeningQuery} from 'sanity-plugin-utils'

import DocumentPreview from './DocumentPreview'
import {separateReferences} from './separateReferences'

type DeleteTranslationDialogProps = {
  doc: SanityDocument
  documentId: string
  setTranslations: (translations: SanityDocument[]) => void
}

export default function DeleteTranslationDialog(
  props: DeleteTranslationDialogProps
) {
  const {doc, documentId, setTranslations} = props

  // Get all references and check if any of them are translations metadata
  const {data, loading} = useListeningQuery<SanityDocument[]>(
    `*[references($id)]{_id, _type}`,
    {params: {id: documentId}, initialValue: []}
  )
  const {translations, otherReferences} = useMemo(
    () => separateReferences(data),
    [data]
  )

  useEffect(() => {
    setTranslations(translations)
  }, [setTranslations, translations])

  if (loading) {
    return (
      <Flex padding={4} align="center" justify="center">
        <Spinner />
      </Flex>
    )
  }

  return (
    <Stack space={4}>
      {translations && translations.length > 0 ? (
        <Text>
          This document is a language-specific version which other translations
          depend on.
        </Text>
      ) : (
        <Text>This document does not have connected translations.</Text>
      )}
      <Card border padding={3}>
        <Stack space={4}>
          <Text size={1} weight="semibold">
            {translations && translations.length > 0 ? (
              <>Before this document can be deleted</>
            ) : (
              <>This document can now be deleted</>
            )}
          </Text>
          <DocumentPreview value={doc} type={doc._type} />
          {translations && translations.length > 0 ? (
            <>
              <Card borderTop />
              <Text size={1} weight="semibold">
                The reference in{' '}
                {translations.length === 1
                  ? `this translations document`
                  : `these translations documents`}{' '}
                must be removed
              </Text>
              {translations.map((translation) => (
                <DocumentPreview
                  key={translation._id}
                  value={translation}
                  type={translation._type}
                />
              ))}
            </>
          ) : null}
          {otherReferences && otherReferences.length > 0 ? (
            <>
              <Card borderTop />
              <Text size={1} weight="semibold">
                {otherReferences.length === 1
                  ? `There is an additional reference`
                  : `There are additional references`}{' '}
                to this document
              </Text>
              {otherReferences.map((reference) => (
                <DocumentPreview
                  key={reference._id}
                  value={reference}
                  type={reference._type}
                />
              ))}
            </>
          ) : null}
        </Stack>
      </Card>
      {otherReferences.length === 0 ? (
        <Text>This document has no other references.</Text>
      ) : (
        <Text>
          You may not be able to delete this document because other documents
          refer to it.
        </Text>
      )}
    </Stack>
  )
}
