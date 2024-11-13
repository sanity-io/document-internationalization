import {CopyIcon} from '@sanity/icons'
import {useToast} from '@sanity/ui'
import {uuid} from '@sanity/uuid'
import {useCallback, useMemo, useState} from 'react'
import {filter, firstValueFrom} from 'rxjs'
import {
  DEFAULT_STUDIO_CLIENT_OPTIONS,
  type DocumentActionComponent,
  type Id,
  InsufficientPermissionsMessage,
  type PatchOperations,
  useClient,
  useCurrentUser,
  useDocumentOperation,
  useDocumentPairPermissions,
  useDocumentStore,
  useTranslation,
} from 'sanity'
import {useRouter} from 'sanity/router'
import {structureLocaleNamespace} from 'sanity/structure'

import {METADATA_SCHEMA_NAME, TRANSLATIONS_ARRAY_NAME} from '../constants'
import {useTranslationMetadata} from '../hooks/useLanguageMetadata'
import {documenti18nLocaleNamespace} from '../i18n'

const DISABLED_REASON_KEY = {
  METADATA_NOT_FOUND: 'action.duplicate.disabled.missing-metadata',
  MULTIPLE_METADATA: 'action.duplicate.disabled.multiple-metadata',
  NOTHING_TO_DUPLICATE: 'action.duplicate.disabled.nothing-to-duplicate',
  NOT_READY: 'action.duplicate.disabled.not-ready',
}

export const DuplicateWithTranslationsAction: DocumentActionComponent = ({
  id,
  type,
  onComplete,
}) => {
  const documentStore = useDocumentStore()
  const {duplicate} = useDocumentOperation(id, type)
  const {navigateIntent} = useRouter()
  const [isDuplicating, setDuplicating] = useState(false)
  const [permissions, isPermissionsLoading] = useDocumentPairPermissions({
    id,
    type,
    permission: 'duplicate',
  })
  const {data, loading: isMetadataDocumentLoading} = useTranslationMetadata(id)
  const hasOneMetadataDocument = useMemo(() => {
    return Array.isArray(data) && data.length <= 1
  }, [data])
  const metadataDocument = Array.isArray(data) && data.length ? data[0] : null
  const client = useClient(DEFAULT_STUDIO_CLIENT_OPTIONS)
  const toast = useToast()
  const {t: tStructure} = useTranslation(structureLocaleNamespace)
  const {t: tPlugin} = useTranslation(documenti18nLocaleNamespace)
  const currentUser = useCurrentUser()

  const handle = useCallback(async () => {
    setDuplicating(true)

    try {
      if (!metadataDocument) {
        throw new Error('Metadata document not found')
      }

      // 1. Duplicate the document and its localized versions
      const translations = new Map<string, Id>()
      for (const translation of metadataDocument[TRANSLATIONS_ARRAY_NAME]) {
        const dupeId = uuid()
        const translationLocale = translation._key
        const translationId = translation.value?._ref

        if (!translationId) {
          throw new Error('Translation document not found')
        }

        const {duplicate: duplicateTranslation} = await firstValueFrom(
          documentStore.pair
            .editOperations(translationId, type)
            .pipe(filter((op) => op.duplicate.disabled !== 'NOT_READY'))
        )

        if (duplicateTranslation.disabled) {
          throw new Error('Cannot duplicate document')
        }

        const duplicateTranslationSuccess = firstValueFrom(
          documentStore.pair
            .operationEvents(translationId, type)
            .pipe(filter((e) => e.op === 'duplicate' && e.type === 'success'))
        )

        duplicateTranslation.execute(dupeId)
        await duplicateTranslationSuccess

        translations.set(translationLocale, dupeId)
      }

      // 2. Duplicate the metadata document
      const {duplicate: duplicateMetadata} = await firstValueFrom(
        documentStore.pair
          .editOperations(metadataDocument._id, METADATA_SCHEMA_NAME)
          .pipe(filter((op) => op.duplicate.disabled !== 'NOT_READY'))
      )

      if (duplicateMetadata.disabled) {
        throw new Error('Cannot duplicate document')
      }

      const duplicateMetadataSuccess = firstValueFrom(
        documentStore.pair
          .operationEvents(metadataDocument._id, METADATA_SCHEMA_NAME)
          .pipe(filter((e) => e.op === 'duplicate' && e.type === 'success'))
      )

      const dupeId = uuid()

      duplicateMetadata.execute(dupeId)
      await duplicateMetadataSuccess

      // 3. Patch the duplicated metadata document to update the references
      // TODO: use document store
      // const { patch } = await firstValueFrom(
      //   documentStore.pair
      //     .editOperations(dupeId, METADATA_SCHEMA_NAME)
      //     .pipe(filter((op) => op.patch.disabled !== "NOT_READY")),
      // );

      // if (patch.disabled) {
      //   throw new Error("Cannot patch document");
      // }

      // const patchSuccess = firstValueFrom(
      //   documentStore.pair
      //     .operationEvents(dupeId, METADATA_SCHEMA_NAME)
      //     .pipe(filter((e) => e.op === "patch" && e.type === "success")),
      // );

      const patch: PatchOperations = {
        set: Object.fromEntries(
          Array.from(translations.entries()).map(([locale, documentId]) => [
            `${TRANSLATIONS_ARRAY_NAME}[_key == "${locale}"].value._ref`,
            documentId,
          ])
        ),
      }

      // patch.execute(patches);
      // await patchSuccess;
      await client.transaction().patch(dupeId, patch).commit()

      // 4. Navigate to the duplicated document
      navigateIntent('edit', {
        id: Array.from(translations.values()).at(0),
        type,
      })

      onComplete()
    } catch (error) {
      console.error(error)
      toast.push({
        status: 'error',
        title: 'Error duplicating document',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to duplicate document',
      })
    } finally {
      setDuplicating(false)
    }
  }, [
    client,
    documentStore.pair,
    metadataDocument,
    navigateIntent,
    onComplete,
    toast,
    type,
  ])

  return useMemo(() => {
    if (!isPermissionsLoading && !permissions?.granted) {
      return {
        icon: CopyIcon,
        disabled: true,
        label: tPlugin('action.duplicate.label'),
        title: (
          <InsufficientPermissionsMessage
            context="duplicate-document"
            currentUser={currentUser}
          />
        ),
      }
    }

    if (!isMetadataDocumentLoading && !metadataDocument) {
      return {
        icon: CopyIcon,
        disabled: true,
        label: tPlugin('action.duplicate.label'),
        title: tPlugin(DISABLED_REASON_KEY.METADATA_NOT_FOUND),
      }
    }

    if (!hasOneMetadataDocument) {
      return {
        icon: CopyIcon,
        disabled: true,
        label: tPlugin('action.duplicate.label'),
        title: tPlugin(DISABLED_REASON_KEY.MULTIPLE_METADATA),
      }
    }

    return {
      icon: CopyIcon,
      disabled:
        isDuplicating ||
        Boolean(duplicate.disabled) ||
        isPermissionsLoading ||
        isMetadataDocumentLoading,
      label: isDuplicating
        ? tStructure('action.duplicate.running.label')
        : tPlugin('action.duplicate.label'),
      title: duplicate.disabled
        ? tStructure(DISABLED_REASON_KEY[duplicate.disabled])
        : '',
      onHandle: handle,
    }
  }, [
    currentUser,
    tPlugin,
    duplicate.disabled,
    handle,
    hasOneMetadataDocument,
    isDuplicating,
    isMetadataDocumentLoading,
    isPermissionsLoading,
    metadataDocument,
    permissions?.granted,
    tStructure,
  ])
}

DuplicateWithTranslationsAction.action = 'duplicate'
// @ts-expect-error `displayName` is used by React DevTools
DuplicateWithTranslationsAction.displayName = 'DuplicateWithTranslationsAction'
