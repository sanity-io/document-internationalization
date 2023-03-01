import {SanityClient} from '@sanity/client'
import {useClient} from 'sanity'

export function useSanityClient(): SanityClient {
  return useClient({apiVersion: '2021-10-01'})
}
