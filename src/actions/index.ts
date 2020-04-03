import { IResolverProps, Ti18nSchema } from '../types';
import defaultResolve, { PublishAction } from 'part:@sanity/base/document-actions'
import { PublishWithi18nAction } from './PublishWithi18nAction';
import { getSchema } from '../utils';

export default (props: IResolverProps) => {
    const schema: Ti18nSchema = getSchema(props.type);
    return defaultResolve(props).map(Action => (Action === PublishAction && schema && schema.i18n) ? PublishWithi18nAction : Action);
}