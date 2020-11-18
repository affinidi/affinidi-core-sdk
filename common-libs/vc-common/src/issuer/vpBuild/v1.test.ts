import { VCV1Subject, VCV1, VPV1Unsigned, VPV1 } from '../../'
import { Secp256k1Key, Secp256k1Signature } from '@affinidi/tiny-lds-ecdsa-secp256k1-2019'

import { buildVPV1Unsigned, buildVPV1, presentationSubmissionContext } from './v1'
import { buildVCV1Skeleton, buildVCV1Unsigned, buildVCV1 } from '../vcBuild/v1'
import { GetSignSuiteFn } from '../common'

const jsonld = require('jsonld')

const did = 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ'
const didLongForm = `${did};elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ`
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

/*
 _____  _                        _   __                     ___                _   _         _     _____                    _  _    _
|_   _|| |                      | | / /                    / _ \              | \ | |       | |   /  ___|                  (_)| |  (_)
  | |  | |__    ___  ___   ___  | |/ /   ___  _   _  ___  / /_\ \ _ __   ___  |  \| |  ___  | |_  \ `--.   ___  _ __   ___  _ | |_  _ __   __  ___
  | |  | '_ \  / _ \/ __| / _ \ |    \  / _ \| | | |/ __| |  _  || '__| / _ \ | . ` | / _ \ | __|  `--. \ / _ \| '_ \ / __|| || __|| |\ \ / / / _ \
  | |  | | | ||  __/\__ \|  __/ | |\  \|  __/| |_| |\__ \ | | | || |   |  __/ | |\  || (_) || |_  /\__/ /|  __/| | | |\__ \| || |_ | | \ V / |  __/
  \_/  |_| |_| \___||___/ \___| \_| \_/ \___| \__, ||___/ \_| |_/|_|    \___| \_| \_/ \___/  \__| \____/  \___||_| |_||___/|_| \__||_|  \_/   \___|
                                               __/ |
                                              |___/

The keys below this message are used to test that key cryptographic functionality does not break.
They are fixtures and should not be considered sensitive.
*/
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
/*
 _____             _           __    __  _        _
|  ___|           | |         / _|  / _|(_)      | |
| |__   _ __    __| |   ___  | |_  | |_  _ __  __| |_  _   _  _ __   ___  ___
|  __| | '_ \  / _` |  / _ \ |  _| |  _|| |\ \/ /| __|| | | || '__| / _ \/ __|
| |___ | | | || (_| | | (_) || |   | |  | | >  < | |_ | |_| || |   |  __/\__ \
\____/ |_| |_| \__,_|  \___/ |_|   |_|  |_|/_/\_\ \__| \__,_||_|    \___||___/


*/

const documentLoader = async (url: string): Promise<any> => {
  if (url.startsWith('did:')) {
    return {
      contextUrl: null,
      document: didDoc,
      documentUrl: url,
    }
  }

  if (url === 'https://example.com') {
    return {
      contextUrl: null,
      document: {},
      documentUrl: url,
    }
  }

  return jsonld.documentLoaders.node()(url)
}

const getSignSuite: GetSignSuiteFn = async ({ controller, keyId, privateKey }) =>
  new Secp256k1Signature({
    key: new Secp256k1Key({
      id: keyId,
      controller,
      privateKeyHex: privateKey,
    }),
  })

const credentialSubject: VCV1Subject<{ '@type': string; key: string }> = {
  id: did,
  data: { '@type': 'Thing', key: 'value' },
}
const vcId = 'urn:uuid:75442486-0878-440c-9db1-a7006c25a39f'
const vpId = 'urn:uuid:11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000'
const holder = {
  id: did,
}

describe('buildVPV1Unsigned', () => {
  let vcs: VCV1[]
  const warnSpy = jest.spyOn(global.console, 'warn')

  beforeEach(async () => {
    jest.clearAllMocks()

    const vc = await buildVCV1({
      unsigned: buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton({
          id: vcId,
          credentialSubject,
          holder,
          type: 'CustomCredential',
          context: {
            '@version': 1.1,
            data: {
              '@id': 'https://docs.affinity-project.org/vc-common/vc/context/index.html#data',
              '@type': '@json',
            },
          },
        }),
        issuanceDate: new Date().toISOString(),
      }),
      issuer: {
        did: didLongForm,
        keyId: `${did}#primary`,
        privateKey: keys.primaryKey.privateKey,
      },
      documentLoader,
      getSignSuite,
    })

    vcs = [vc]
  })

  const expectUnsigned = (unsigned: VPV1Unsigned) => ({
    toStrictEqual: (expected: Record<string, any>) => {
      expect(unsigned).toStrictEqual({
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: vpId,
        type: ['VerifiablePresentation'],
        holder,
        verifiableCredential: vcs,
        ...expected,
      })
    },
  })

  it('builds VPV1Unsigned', () => {
    const unsigned = buildVPV1Unsigned({ id: vpId, vcs, holder })

    expectUnsigned(unsigned).toStrictEqual({})
  })

  it('builds a VPV1Unsigned with multiple types', () => {
    const unsigned = buildVPV1Unsigned({
      id: vpId,
      vcs,
      holder,
      type: ['CustomPresentation', 'SpecialPresentation'],
    })

    expectUnsigned(unsigned).toStrictEqual({
      type: ['VerifiablePresentation', 'CustomPresentation', 'SpecialPresentation'],
    })
  })

  it('builds a VPV1Unsigned with a duplicated base type', () => {
    const unsigned = buildVPV1Unsigned({
      id: vpId,
      vcs,
      holder,
      type: ['VerifiablePresentation', 'CustomPresentation'],
    })

    expectUnsigned(unsigned).toStrictEqual({
      type: ['VerifiablePresentation', 'CustomPresentation'],
    })
  })

  it('builds a VPV1Unsigned with custom contexts', () => {
    const unsigned = buildVPV1Unsigned({
      id: vpId,
      vcs,
      holder,
      context: 'https://example.com',
    })

    expectUnsigned(unsigned).toStrictEqual({
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com'],
    })
  })

  it('builds a VPV1Unsigned with a duplicated base context', () => {
    const unsigned = buildVPV1Unsigned({
      id: vpId,
      vcs,
      holder,
      context: 'https://www.w3.org/2018/credentials/v1',
    })

    expectUnsigned(unsigned).toStrictEqual({
      '@context': ['https://www.w3.org/2018/credentials/v1'],
    })
  })

  it('builds a VPV1Unsigned with multiple custom contexts', () => {
    const unsigned = buildVPV1Unsigned({
      id: vpId,
      vcs,
      holder,
      context: ['https://example.com', 'https://example2.com'],
    })

    expectUnsigned(unsigned).toStrictEqual({
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com', 'https://example2.com'],
    })
  })

  it('builds a VPV1Unsigned with a presentation submission', () => {
    const unsigned = buildVPV1Unsigned({
      id: vpId,
      vcs,
      holder,
      presentation_submission: {
        descriptor_map: [
          {
            id: 'vc_input_descriptor_id_1',
            path: '$.verifiableCredential[0]',
            format: 'ldp_vc',
          },
        ],
      },
    })

    expectUnsigned(unsigned).toStrictEqual({
      '@context': ['https://www.w3.org/2018/credentials/v1', presentationSubmissionContext],
      type: ['VerifiablePresentation', 'PresentationSubmission'],
      presentation_submission: {
        descriptor_map: [
          {
            id: 'vc_input_descriptor_id_1',
            path: '$.verifiableCredential[0]',
            format: 'ldp_vc',
          },
        ],
      },
    })
  })

  it('warns when id is not provided', () => {
    buildVPV1Unsigned({
      vcs,
      holder,
      context: ['https://example.com', 'https://example2.com'],
    })

    expect(warnSpy).toBeCalledTimes(1)
    expect(warnSpy).toBeCalledWith(
      'Warning: An id should be supplied for the VP. Otherwise top-level, non-object properties (like "type") will be malleable.',
    )
  })

  it('warns when id is not an absolute URI', () => {
    buildVPV1Unsigned({
      id: '123',
      vcs,
      holder,
      context: ['https://example.com', 'https://example2.com'],
    })

    expect(warnSpy).toBeCalledTimes(1)
    expect(warnSpy).toBeCalledWith(
      'Warning: VC ids must be absolute URIs ' +
        '(https://www.w3.org/TR/vc-data-model/#identifiers). ' +
        'To use UUIDs prefix the UUID with "urn:uuid:" ' +
        '(eg. "urn:uuid:11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000")',
    )
  })
})

describe('buildVPV1', () => {
  let unsigned: VPV1Unsigned
  let vcs: VCV1[]
  const warnSpy = jest.spyOn(global.console, 'warn')

  beforeEach(async () => {
    jest.clearAllMocks()
    const vc = await buildVCV1({
      unsigned: buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton({
          id: vcId,
          credentialSubject,
          holder,
          type: 'CustomCredential',
          context: {
            '@version': 1.1,
            data: {
              '@id': 'https://docs.affinity-project.org/vc-common/vc/context/index.html#data',
              '@type': '@json',
            },
          },
        }),
        issuanceDate: new Date().toISOString(),
      }),
      issuer: {
        did: didLongForm,
        keyId: `${did}#primary`,
        privateKey: keys.primaryKey.privateKey,
      },
      documentLoader,
      getSignSuite,
    })

    vcs = [vc]

    unsigned = buildVPV1Unsigned({
      id: vpId,
      vcs,
      holder,
      presentation_submission: {
        descriptor_map: [
          {
            id: 'vc_input_descriptor_id_1',
            path: '$.verifiableCredential[0]',
            format: 'ldp_vc',
            path_nested: {
              id: 'vc_input_descriptor_id_2',
              path: '$.verifiableCredential[0]',
              format: 'ldp_vc',
            },
          },
        ],
      },
    })
  })

  const expectSigned = (vp: VPV1) => ({
    toStrictEqual: (expected: Record<string, any>) => {
      expect(vp).toStrictEqual({
        ...expected,
        '@context': ['https://www.w3.org/2018/credentials/v1', presentationSubmissionContext],
        id: vpId,
        type: ['VerifiablePresentation', 'PresentationSubmission'],
        holder,
        presentation_submission: {
          descriptor_map: [
            {
              id: 'vc_input_descriptor_id_1',
              path: '$.verifiableCredential[0]',
              format: 'ldp_vc',
              path_nested: {
                id: 'vc_input_descriptor_id_2',
                path: '$.verifiableCredential[0]',
                format: 'ldp_vc',
              },
            },
          ],
        },
        verifiableCredential: vcs,
      })
    },
  })

  it('builds VPV1', async () => {
    expect.assertions(1)

    const vp = await buildVPV1({
      unsigned,
      holder: {
        did: didLongForm,
        keyId: `${did}#primary`,
        privateKey: keys.primaryKey.privateKey,
      },
      documentLoader,
      getSignSuite,
      getProofPurposeOptions: () => ({ challenge: 'challenge', domain: 'domain' }),
    })

    expectSigned(vp).toStrictEqual({
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: expect.any(String),
        challenge: 'challenge',
        domain: 'domain',
        proofPurpose: 'authentication',
        verificationMethod: `${did}#primary`,
        jws: expect.any(String),
      },
    })
  })

  it('warns when id is not provided', async () => {
    expect.assertions(2)

    const copy = { ...unsigned }
    delete copy['id']

    await buildVPV1({
      unsigned: copy,
      holder: {
        did: didLongForm,
        keyId: `${did}#primary`,
        privateKey: keys.primaryKey.privateKey,
      },
      documentLoader,
      getSignSuite,
      getProofPurposeOptions: () => ({ challenge: 'challenge', domain: 'domain' }),
    })

    expect(warnSpy).toBeCalledTimes(1)
    expect(warnSpy).toBeCalledWith(
      'Warning: An id should be supplied for the VP. Otherwise top-level, non-object properties (like "type") will be malleable.',
    )
  })

  it('throws when id is not an absolute URI', async () => {
    expect.assertions(1)

    expect(
      buildVPV1({
        unsigned: { ...unsigned, id: '123' },
        holder: {
          did: didLongForm,
          keyId: `${did}#primary`,
          privateKey: keys.primaryKey.privateKey,
        },
        documentLoader,
        getSignSuite,
        getProofPurposeOptions: () => ({ challenge: 'challenge', domain: 'domain' }),
      }),
    ).rejects.toThrow()
  })
})
