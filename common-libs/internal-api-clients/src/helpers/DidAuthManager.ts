import { DidAuthAdapter } from '../helpers/DidAuthAdapter'

export const createDidAuthSession = (didAuthAdapter: DidAuthAdapter) => {
  let responseToken: string | undefined

  return {
    async getResponseToken(createRequestToken: (did: string) => Promise<string>) {
      if (!responseToken || didAuthAdapter.isTokenExpired(responseToken)) {
        const didAuthRequestToken = await createRequestToken(didAuthAdapter.did)

        responseToken = await didAuthAdapter.createDidAuthResponseToken(didAuthRequestToken)
      }

      return responseToken
    },
  }
}

export type DidAuthSession = ReturnType<typeof createDidAuthSession>
