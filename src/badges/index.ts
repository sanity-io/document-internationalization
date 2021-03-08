import defaultResolve from 'part:@sanity/base/document-badges';
import { LanguageBadge } from './LanguageBadge'
import { IResolverProps } from '../types';

const resolver = (props: IResolverProps) => {
    return [...defaultResolve(props), LanguageBadge];
}

export default resolver;
export { LanguageBadge };
