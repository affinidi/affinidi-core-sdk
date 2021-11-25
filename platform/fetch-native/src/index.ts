import { configureFetch } from '@affinidi/platform-fetch'

export const useNativeFetch = () => {
  // TODO: fix the types
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  configureFetch(fetch)
}
