import defaultResolve from 'part:@sanity/base/document-badges';
import { LangaugeBadge } from './LanguageBadge'
import { IBadgeProps } from './IBadgeProps';

const resolver = (props: IBadgeProps) => {
    return [...defaultResolve(props), LangaugeBadge];
}

export default resolver;