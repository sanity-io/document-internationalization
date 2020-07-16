declare module 'part:@sanity/*';

declare module 'config:sanity' {
  const config: {
    config?: {
      plugins?: {
        'intl-input'?: import('./types').Ti18nConfig & {
          withTranslationsMaintenance?: boolean;
        }
      }
    }
  };
  export default config;
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