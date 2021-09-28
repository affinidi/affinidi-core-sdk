import { DidAuthAdapter } from '../helpers/DidAuthAdapter'

export const createDidAuthSession = (didAuthAdapter: DidAuthAdapter) => {
  let responseTokenInfo: { tokenRequestTime: number; responseToken: string } | undefined

  return {
    async getResponseToken(createRequestToken: (did: string) => Promise<string>) {
      if (
        !responseTokenInfo ||
        didAuthAdapter.isTokenExpired(responseTokenInfo.responseToken, responseTokenInfo.tokenRequestTime)
      ) {
        const tokenRequestTime = Date.now()

        const didAuthRequestToken = await createRequestToken(didAuthAdapter.did)

        const responseToken = await didAuthAdapter.createDidAuthResponseToken(didAuthRequestToken)

        responseTokenInfo = { tokenRequestTime, responseToken }
      }

      return responseTokenInfo.responseToken
    },
  }
}

export type DidAuthSession = ReturnType<typeof createDidAuthSession>
