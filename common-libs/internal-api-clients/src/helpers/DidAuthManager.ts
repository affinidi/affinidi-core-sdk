import { DidAuthAdapterType } from './didAuthClientWrapper'

type ResponseTokenInfo = {
  requestTime: number
  responseToken: string
}

const isValidResponseToken = (didAuthAdapter: DidAuthAdapterType, responseTokenInfo?: ResponseTokenInfo) => {
  if (!responseTokenInfo) {
    return false
  }

  const { requestTime, responseToken } = responseTokenInfo
  return !didAuthAdapter.isResponseTokenExpired(responseToken, requestTime)
}

export const createDidAuthSession = (didAuthAdapter: DidAuthAdapterType) => {
  let responseTokenInfo: ResponseTokenInfo | undefined

  return {
    async getResponseToken(createRequestToken: (did: string) => Promise<string>) {
      if (!isValidResponseToken(didAuthAdapter, responseTokenInfo)) {
        const requestTime = Date.now()

        const didAuthRequestToken = await createRequestToken(didAuthAdapter.did)

        const responseToken = await didAuthAdapter.createDidAuthResponseToken(didAuthRequestToken)

        responseTokenInfo = { requestTime, responseToken }
      }

      return responseTokenInfo?.responseToken
    },
  }
}

export type DidAuthSession = ReturnType<typeof createDidAuthSession>
