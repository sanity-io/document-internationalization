import 'regenerator-runtime' // eslint-disable-line
import defaultResolve, {PublishAction, DeleteAction} from 'part:@sanity/base/document-actions'
import type {DocumentActionComponent} from '@sanity/base'
import {IResolverProps, Ti18nSchema} from '../types'
import {getSchema, getBaseIdFromId} from '../utils'
import {PublishWithi18nAction} from './PublishWithi18nAction'
import {DeleteWithi18nAction} from './DeleteWithi18nAction'
import {DuplicateWithi18nAction} from './DuplicateWithi18nAction'

export {PublishWithi18nAction, DeleteWithi18nAction, DuplicateWithi18nAction}

export default (props: IResolverProps): DocumentActionComponent[] => {
  const schema: Ti18nSchema = getSchema(props.type)
  const isI18n = schema && schema.i18n
  const isBase = props.id == getBaseIdFromId(props.id)
  let actions = defaultResolve(props)

  if (isI18n) {
    actions = actions.map((Action) => {
      const isPublishAction = Action === PublishAction
      const isDeleteAction = Action === DeleteAction

      // replace default publish actions with i18n publish actions
      if (isPublishAction) {
        return PublishWithi18nAction
      }

      // replace base delete action with delete with i18n action
      if (isDeleteAction && isBase) {
        return DeleteWithi18nAction
      }

      return Action
    })

    // push duplicate action
    if (isBase) {
      actions.push(DuplicateWithi18nAction)
    }
  }

  return actions
}
