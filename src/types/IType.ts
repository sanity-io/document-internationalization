export interface IType {
    name: string;
    hidden?: boolean;
    level: number;
    type: string;
    fields: any[];
    options: {
        [key: string]: any;
    };
}