declare module 'part:@sanity/*';

declare module 'config:@sanity/document-internationalization' {
  const config: import('./types').Ti18nConfig & {
    withTranslationsMaintenance?: boolean;
  };
  export default config;
}

declare module '@sanity/state-router/lib/RouterContext' {
  export const RouterContext: React.Context<{
    resolveIntentLink: (intentName: string, params?: Record<string, any> | [Record<string, any>, Record<string, any>]) => string;
    resolvePathFromState: (input: any) => string
    navigateUrl: (href: string) => void
  }>;
}

declare module '@sanity/desk-tool/lib/components/confirmDeleteDialog/ConfirmDeleteDialog' {
  export const ConfirmDeleteDialog: React.FC<{
    id: string;
    type: string;
    action?: string;
    onCancel?: () => void;
    onConfirm?: () => void;
  }>;
  export default ConfirmDeleteDialog;
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

declare module '@sanity/desk-tool/lib/panes/document/DocumentPaneContext' {
  // @README https://github.com/sanity-io/sanity/blob/next/packages/%40sanity/desk-tool/src/panes/document/DocumentPaneContext.ts
  export const DocumentPaneContext: React.Context<{
    displayed: import('@sanity/client').SanityDocument<any> | null;
  }>;
}

declare module 'part:@sanity/base/schema' {
  const schemas: {
    _original: {
      types: import('./types').TSchema[];
    };
  };
  export default schemas;
}

declare module 'part:@sanity/document-internationalization/languages/loader?' {
  type ILanguageObject = import('./types').ILanguageObject;
  type TLoaderFnResult = Promise<ILanguageObject[]> | ILanguageObject[];
  const loader: ((languages: ILanguageObject[], document?: import('@sanity/client').SanityDocument | null) => TLoaderFnResult) | undefined;
  export default loader;
}

declare module 'part:@sanity/document-internationalization/languages/should-reload?' {
  const fn: (document?: import('@sanity/client').SanityDocument | null) => boolean;
  export default fn;
}

declare module 'part:@sanity/document-internationalization/ui/flags?' {
  const flags: Record<string, React.ComponentType<{
    code: string;
  }>> | undefined;
  export = flags;
}

declare module '@sanity/language-filter' {
  const SelectLanguageProvider: React.FC<{
    schemaType?: import('@sanity/types').SchemaType
  }>
  export default SelectLanguageProvider
}

declare module '*.css' {
  const c: { [key: string]: string; };
  export = c;
}