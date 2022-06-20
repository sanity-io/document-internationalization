import {useMemo} from 'react'
import {SanityClient} from '@sanity/client'
import {useClient} from 'sanity'

export function useSanityClient(): SanityClient {
  const client = useClient()
  return useMemo(() => client.withConfig({apiVersion: `2021-10-01`}), [client])
}
