declare module 'part:@sanity/*';

declare module 'config:intl-input' {
  const config: import('./types').Ti18nConfig & {
    withTranslationsMaintenance?: boolean;
  };
  export default config;
}

declare module '@sanity/state-router/lib/RouterContext' {
  export const RouterContext: React.Context<{
    resolveIntentLink: (intentName: string, params?: Record<string, any> | [Record<string, any>, Record<string, any>]) => string;
  }>;
}

declare module '@sanity/desk-tool/lib/components/ConfirmDelete' {
  export const ConfirmDelete: React.FC<{
    draft?: import('@sanity/client').SanityDocument<any>;
    published?: import('@sanity/client').SanityDocument<any>;
    onCancel?: () => void;
    onConfirm?: () => void;
  }>;
  export default ConfirmDelete;
}

declare module '@sanity/desk-tool/lib/components/enhanceWithReferringDocuments' {
  export function enhanceWithReferringDocuments<P = {}>(component: React.ComponentType<P & {
    referringDocuments: Record<string, any>[]
    isCheckingReferringDocuments: boolean
    published?: import('@sanity/types').SanityDocument | null
  }>): React.ComponentType<P>;
}

declare module '@sanity/desk-tool/lib/components/DocTitle' {
  export const DocTitle: React.FunctionComponent<{
    document?: import('@sanity/types').SanityDocument | null
  }>
}

declare module '@sanity/state-router/lib/components/IntentLink' {
  const IntentLink: React.FC<{
    intent: string;
    params?: Record<string, any> | [Record<string, any>, Record<string, any>];
  } & React.HTMLProps<HTMLAnchorElement>>;
  export default IntentLink;
}

declare module 'part:@sanity/base/schema' {
  const schemas: {
    _original: {
      types: import('./types').TSchema[];
    };
  };
  export default schemas;
}

declare module '*.scss' {
    const c: { [key: string]: string; };
    export = c;
}

declare module '*.css' {
  const c: { [key: string]: string; };
  export = c;
}