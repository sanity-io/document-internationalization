import _ from 'lodash'

const BATCH_SIZE = 50

export async function batch<R>(input: R[], fn: (input: R[]) => Promise<void>) {
  const batched = _.chunk(input, BATCH_SIZE)
  for (let i = 0; i < batched.length; i++) {
    await fn(batched[i])
  }
}
