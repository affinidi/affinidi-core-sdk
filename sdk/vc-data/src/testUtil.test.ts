import { buildVCV1Unsigned, buildVCV1 } from '@affinidi/vc-common'
import { VCV1, VCV1Skeleton, VCV1Subject } from '@affinidi/vc-common'
import { Secp256k1Signature, Secp256k1Key } from '@affinidi/tiny-lds-ecdsa-secp256k1-2019'

const jsonld = require('jsonld')

const didUri =
  'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ'
const didDoc = {
  '@context': 'https://w3id.org/security/v2',
  publicKey: [
    {
      id: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '02c04dc60d416dd604b9a06eb0d3e52752e937eb3fe4646e005ec770c766b12096',
    },
    {
      id: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#recovery',
      usage: 'recovery',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '032b43caaf403ace5af200fbb89efcdd7610124c543a449c5124357290a1d65816',
    },
  ],
  authentication: ['did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#primary'],
  assertionMethod: ['did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#primary'],
  id: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ',
}

const keys = {
  primaryKey: {
    publicKey: '02c04dc60d416dd604b9a06eb0d3e52752e937eb3fe4646e005ec770c766b12096',
    privateKey: 'dbcec07b9f9816ac5cec1dadadde64fc0ed610be39b06a77a238e95df36d774a',
  },
  recoveryKey: {
    publicKey: '032b43caaf403ace5af200fbb89efcdd7610124c543a449c5124357290a1d65816',
    privateKey: '03f8547441c20a6be216d8335e9dd96021a0a5de84db12bbe40af1bb7cbdc276',
  },
}

export const expandVC = async <VC extends VCV1, VCS extends VCV1Subject<any>>({
  data,
  type,
  context,
}: {
  data: VCS['data'] | VCS['data'][]
  type: VC['type'][1]
  context: { [key: string]: any }
}) => {
  const skeleton: Omit<VCV1Skeleton<VC['credentialSubject']>, 'id' | 'holder'> = {
    '@context': ['https://www.w3.org/2018/credentials/v1', context],
    type: ['VerifiableCredential', type],
    credentialSubject: (Array.isArray(data) ? data : [data]).map((item) => ({ data: item })),
  }

  // Ensure that the VC can be signed, this makes sure all fields are properly mapped in the context
  try {
    await buildVCV1({
      unsigned: buildVCV1Unsigned<VC['credentialSubject'], never>({
        skeleton: {
          ...skeleton,
          id: '123',
          holder: {
            id: 'did:elem:123',
          },
        },
        issuanceDate: new Date().toDateString(),
      }),
      issuer: {
        did: didUri,
        keyId: `${didDoc.id}#primary`,
        privateKey: keys.primaryKey.privateKey,
      },
      documentLoader: (url) => {
        if (url.startsWith('did:')) {
          return {
            contextUrl: null,
            document: didDoc,
            documentUrl: url,
          }
        }

        return jsonld.documentLoaders.node()(url)
      },
      getSignSuite: ({ keyId, controller, privateKey }) =>
        new Secp256k1Signature({
          key: new Secp256k1Key({
            id: keyId,
            controller,
            privateKeyHex: privateKey,
          }),
        }),
    })
  } catch (error) {
    fail(error)
  }

  return (await jsonld.expand(skeleton))[0]
}

describe('', () => {
  it('', () => {
    expect(true).toBeTruthy()
  })
})
