'use strict'
import { expect } from 'chai'
import ApiService from '../../../src/services/ApiService'

describe('ApiService', () => {
  it.skip('#CreateSignedCredential', async () => {
    const registryUrl = 'http://127.0.0.1:3000'
    const issuerUrl = 'http://127.0.0.1:3001'
    const verifierUrl = 'http://127.0.0.1:3002'

    const api = new ApiService(registryUrl, issuerUrl, verifierUrl)
    const claim = { email: 'user@email.com' }

    const claimMetadata = {
      context: [
        {
          ProofOfEmailCredential: 'https://identity.jolocom.com/terms/ProofOfEmailCredential',
          schema: 'http://schema.org/',
          email: 'schema:email',
        },
      ],
      name: 'Email address',
      type: ['Credential', 'ProofOfEmailCredential'],
      claimInterface: {
        email: '',
      },
    }

    const requesterDid = 'did:jolo:38d3f409d91876b58d84587dca729faf90e31fdffe08f2688afdcaf5cb82a38b'
    const params = { claim, claimMetadata, requesterDid }

    const response = await api.execute('issuer.CreateSignedCredential', { params })

    expect(response.body).to.exist
  })
})
