import schemas from 'part:@sanity/base/schema';
import { TSchema } from '../types';

export const getSchema = <T = any>(name: string): TSchema<T> => {
    return schemas._original.types.find(s => s.name === name);
}