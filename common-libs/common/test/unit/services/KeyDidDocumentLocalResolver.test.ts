import { resolveDidKeyLocal } from '../../../src/services/DidDocumentService/KeyDidDocumentLocalResolver'
import { expect } from 'chai'

const didKey = 'did:key:zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd'

describe('#resolveDidKeyLocal', () => {
  it('should resolve legacy did elem', async () => {
    const resolved = await resolveDidKeyLocal(didKey)

    console.log(JSON.stringify(resolved, null, 2))
    expect(resolved).to.be.deep.eq({
      '@context': 'https://w3id.org/security/v2',
      publicKey: [
        {
          id: 'did:elem:EiAab5TYE15xf761dDpSUrUUa77W7xoRo6VlbM80yrMefw#primary',
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: '03da6ed942b7292152352f0ab2dff0e0283a091c864f86833a5a88dc40c7bf2e04',
        }
      ],
      authentication: ['did:elem:EiAab5TYE15xf761dDpSUrUUa77W7xoRo6VlbM80yrMefw#primary'],
      assertionMethod: ['did:elem:EiAab5TYE15xf761dDpSUrUUa77W7xoRo6VlbM80yrMefw#primary'],
      id: 'did:elem:EiAab5TYE15xf761dDpSUrUUa77W7xoRo6VlbM80yrMefw',
    })
  })
})
