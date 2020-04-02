import { SanityDocument } from '@sanity/client';

export interface IBadgeProps<T = any> {
    id: string;
    type: string;
    liveEdit: boolean;
    draft: SanityDocument<T>;
    published?: SanityDocument<T>;
    onComplete?: () => void;
}