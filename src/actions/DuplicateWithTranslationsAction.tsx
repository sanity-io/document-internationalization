import {CopyIcon} from '@sanity/icons'
import {useToast} from '@sanity/ui'
import {uuid} from '@sanity/uuid'
import {useCallback, useMemo, useState} from 'react'
import {useObservable} from 'react-rx'
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

const DISABLED_REASON_KEY = {
  // TODO: add localization
  I18N_METADATA_NOT_FOUND: 'This document does not have i18n metadata',
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
  const metadataDocument = useI18nMetadata(id)
  const client = useClient(DEFAULT_STUDIO_CLIENT_OPTIONS)
  const toast = useToast()
  const {t} = useTranslation(structureLocaleNamespace)
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

        const {duplicate: duplicateTranslation} = await firstValueFrom(
          documentStore.pair
            .editOperations(translation.documentId, type)
            .pipe(filter((op) => op.duplicate.disabled !== 'NOT_READY'))
        )

        if (duplicateTranslation.disabled) {
          throw new Error('Cannot duplicate document')
        }

        const duplicateTranslationSuccess = firstValueFrom(
          documentStore.pair
            .operationEvents(translation.documentId, type)
            .pipe(filter((e) => e.op === 'duplicate' && e.type === 'success'))
        )

        duplicateTranslation.execute(dupeId)
        await duplicateTranslationSuccess

        translations.set(translation.locale, dupeId)
      }

      const dupeId = uuid()

      {
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
        duplicateMetadata.execute(dupeId)
        await duplicateMetadataSuccess
      }

      // 3. Patch the duplicated metadata document to update the references
      // TODO: use document store
      {
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
      }

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
        label: t('action.duplicate.label'),
        title: (
          <InsufficientPermissionsMessage
            context="duplicate-document"
            currentUser={currentUser}
          />
        ),
      }
    }

    if (!metadataDocument) {
      return {
        icon: CopyIcon,
        disabled: true,
        label: t('action.duplicate.label'),
        title: DISABLED_REASON_KEY.I18N_METADATA_NOT_FOUND,
      }
    }

    return {
      icon: CopyIcon,
      disabled:
        isDuplicating || Boolean(duplicate.disabled) || isPermissionsLoading,
      label: isDuplicating
        ? t('action.duplicate.running.label')
        : t('action.duplicate.label'),
      title: duplicate.disabled
        ? t(DISABLED_REASON_KEY[duplicate.disabled])
        : '',
      onHandle: handle,
    }
  }, [
    currentUser,
    duplicate.disabled,
    handle,
    isDuplicating,
    isPermissionsLoading,
    metadataDocument,
    permissions?.granted,
    t,
  ])
}

DuplicateWithTranslationsAction.action = 'duplicate'
// @ts-expect-error `displayName` is used by React DevTools
DuplicateWithTranslationsAction.displayName = 'DuplicateWithTranslationsAction'

function useI18nMetadata(
  id: Id
): {_id: Id; translations: {locale: string; documentId: Id}[]} | null {
  const documentStore = useDocumentStore()
  const metadataDocument = useObservable(
    useMemo(
      () =>
        documentStore
          .listenQuery(
            // `*[_type == $type && references($id)][0]._id`,
            `*[_type == $type && references($id)][0]{
        _id,
        ${TRANSLATIONS_ARRAY_NAME}[]{
          "locale": _key,
          "documentId": value._ref,
        }
      }`,
            {id, type: METADATA_SCHEMA_NAME},
            {tag: 'use-i18n-metadata'}
          )
          .pipe(),
      [documentStore, id]
    ),
    null
  )

  return metadataDocument
}
