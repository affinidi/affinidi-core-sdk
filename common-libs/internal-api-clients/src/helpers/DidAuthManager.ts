import { DidAuthAdapter } from '../helpers/DidAuthAdapter'
import { LocalExpiringDidAuthResponseToken } from '@affinidi/affinidi-did-auth-lib'

export const createDidAuthSession = (didAuthAdapter: DidAuthAdapter) => {
  let responseTokenInfo: LocalExpiringDidAuthResponseToken | undefined

  return {
    async getResponseToken(createRequestToken: (did: string) => Promise<string>) {
      if (!responseTokenInfo || responseTokenInfo.isExpiredAt(Date.now())) {
        const tokenRequestTime = Date.now()

        const didAuthRequestToken = await createRequestToken(didAuthAdapter.did)

        const responseToken = await didAuthAdapter.createDidAuthResponseToken(didAuthRequestToken)

        responseTokenInfo = LocalExpiringDidAuthResponseToken.initialize(tokenRequestTime, responseToken)
      }

      return responseTokenInfo.toString()
    },
  }
}

export type DidAuthSession = ReturnType<typeof createDidAuthSession>
