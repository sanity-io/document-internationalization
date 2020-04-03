export type TSchema<T = any> = {
    name: string;
    title: string;
    fields: any[];
} & T;