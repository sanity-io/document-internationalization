import schemas from 'part:@sanity/base/schema'
import {TSchema} from '../types'

export const getAllSchemas = (): TSchema[] => {
  return schemas._original.types
}
