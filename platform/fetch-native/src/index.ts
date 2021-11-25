import { configureFetch } from '@affinidi/platform-fetch'

export const useNativeFetch = () => {
  // eslint-disable-next-line TODO: fix the types
  // @ts-ignore
  configureFetch(fetch)
}
