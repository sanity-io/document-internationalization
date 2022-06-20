import chunk from 'lodash/chunk'

const BATCH_SIZE = 50

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function batch<R>(input: R[], fn: (input: R[]) => Promise<void>) {
  const batched = chunk(input, BATCH_SIZE)
  for (let i = 0; i < batched.length; i++) {
    await fn(batched[i])
  }
}
