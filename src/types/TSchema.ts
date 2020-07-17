export type TSchema<T = any> = T & {
    name: string;
    title: string;
    fields: any[];
};