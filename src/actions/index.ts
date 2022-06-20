import {type DocumentActionComponent, PublishAction, DeleteAction} from 'sanity/desk'
import {type DocumentActionsContext} from 'sanity'
import {Ti18nConfig, Ti18nSchema} from '../types'
import {getBaseIdFromId} from '../utils'
import {createPublishAction} from './PublishWithi18nAction'
import {createDeleteAction} from './DeleteWithi18nAction'
import {createDuplicateAction} from './DuplicateWithi18nAction'

export {createPublishAction, createDeleteAction, createDuplicateAction}

export const resolveActions = (
  prev: DocumentActionComponent[],
  {schema, schemaType, documentId}: DocumentActionsContext,
  pluginConfig: Ti18nConfig
): DocumentActionComponent[] => {
  const type: Ti18nSchema = schema.get(schemaType) as Ti18nSchema
  const isI18n = type && type.i18n
  const isBase = documentId === getBaseIdFromId(documentId)
  let actions = prev

  if (isI18n) {
    actions = actions.map((Action) => {
      const isPublishAction = Action === PublishAction
      const isDeleteAction = Action === DeleteAction

      if (isPublishAction) {
        return createPublishAction(pluginConfig)
      }

      if (isDeleteAction && isBase) {
        return createDeleteAction(pluginConfig)
      }

      return Action
    })

    if (isBase) {
      actions.push(createDuplicateAction(pluginConfig))
    }
  }

  return actions
}
