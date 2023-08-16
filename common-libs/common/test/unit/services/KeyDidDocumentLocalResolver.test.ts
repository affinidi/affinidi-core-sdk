import { resolveDidKeyLocal, resolveKeyDIDWithParams } from '../../../src/services/DidDocumentService/KeyDidDocumentLocalResolver'
import { expect } from 'chai'

const didKey = 'did:key:zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd'
const didKey1 = 'did:key:zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh'

describe('#resolveDidKeyLocal', () => {
  it('should resolve did key', async () => {
    const resolved = await resolveDidKeyLocal(didKey)

    expect(resolved).to.be.deep.eq({
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/jws-2020/v1'
      ],
      publicKey: [
        {
          id: 'did:key:zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd#zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd',
          controller: 'did:key:zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd',
          type: 'Secp256k1VerificationKey2018',
          publicKeyBase58: 'q2Z9QByagL6Vp8MHyy3TtWtR6eZQjPX6jn4mdW67Cufu',
        }
      ],
      authentication: ['did:key:zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd#zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd'],
      assertionMethod: ['did:key:zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd#zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd'],
      capabilityDelegation: ['did:key:zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd#zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd'],
      capabilityInvocation: ['did:key:zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd#zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd'],
      keyAgreement: ['did:key:zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd#zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd'],
      id: 'did:key:zQ3shayiAFLT3zyKP4E2iN3vWi7FrkQkP1wZdfhpZvqmERPXd',
    })
  })

  it('should resolve did key as json format (JWK)', async () => {
    const resolved = await resolveKeyDIDWithParams(didKey1, true)

    console.log(JSON.stringify(resolved, null, 2))
    expect(resolved).to.be.deep.eq({
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/jws-2020/v1'
      ],
      publicKey: [
        {
          id: 'did:key:zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh#zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh',
          type: 'JsonWebKey2020',
          controller: 'did:key:zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh',
          publicKeyJwk: {
            kty: 'EC',
            crv: 'secp256k1',
            x: 'vQ1h5RTk2yIxLprYCbAyfalgajeHtzHuzI56c_glPYQ',
            y: '6pPA_UmS6ti18oCz5AGjazSJrJiXj7m5isFF_4Qo1_8',
          }
        }
      ],
      authentication: ['did:key:zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh#zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh'],
      assertionMethod: ['did:key:zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh#zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh'],
      capabilityDelegation: ['did:key:zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh#zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh'],
      capabilityInvocation: ['did:key:zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh#zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh'],
      keyAgreement: ['did:key:zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh#zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh'],
      id: 'did:key:zQ3shsN61ycuj7Q9b4h2YAieDuBGmSqTQmVqASdZm9V3uqGZh',
    })
  })
})
