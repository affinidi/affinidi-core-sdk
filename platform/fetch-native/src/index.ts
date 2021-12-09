import { setFetchImpl } from '@affinidi/platform-fetch'

export const useNativeFetch = () => {
  setFetchImpl(fetch)
}
