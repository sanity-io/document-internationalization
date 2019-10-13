declare module 'part:@sanity/*';
declare module '*.scss' {
    const c: { [key: string]: string; };
    export = c;
}