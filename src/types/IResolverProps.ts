import { SanityDocument } from '@sanity/client';

export interface IResolverProps<T = any> {
    id: string;
    type: string;
    liveEdit: boolean;
    draft?: SanityDocument<T>;
    published?: SanityDocument<T>;
    onComplete?: () => void;
}