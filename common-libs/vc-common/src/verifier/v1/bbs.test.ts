import { BbsBlsSignature2020, Bls12381G2KeyPair } from '@mattrglobal/jsonld-signatures-bbs'

import { VCV1, GetSignSuiteFn } from '../../'
import { validateVCV1, GetVerifySuiteFn, GetVerifierProofPurposeOptionsFn } from './'
import { Validatied, ErrorConfig } from '../util'
import { buildVCV1, buildVCV1Skeleton, buildVCV1Unsigned } from '../../issuer'
import { parse } from 'did-resolver'

const jsonld = require('jsonld')

function toShortDid(fullDid: string) {
  const result = parse(fullDid)?.did
  if (!result) {
    throw new Error('Invalid did: ' + fullDid)
  }

  return result
}

const holderDid =
  'did:elem:EiBPOmOmRgCcopkf_E1kiyNlMOOJ-MT5IaMpQTZud8Wycw;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVkySTBPVFl3Tm1FeU5EVTFZamt4T1RGa05qaGpZek5rTVdOa1ltUmhZVEpsTm1Oa05UZzNOVGxsWXpaa05HTXpaamM0Tm1VMU1HTTVOemt5Tm1Gall5SjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpVeE0yWTBNekk0WVdZM01UWXhZVGN5WTJObVpqTmhORFkwTXpJM00yTTBNakpsTVdZd1ltVTNOV1ptTnpneE5qWTRZak14WTJJME0yVmxPVFJsWTJJaWZTeDdJbWxrSWpvaUkzTmxZMjl1WkdGeWVTSXNJblZ6WVdkbElqb2ljMmxuYm1sdVp5SXNJblI1Y0dVaU9pSlNjMkZXWlhKcFptbGpZWFJwYjI1TFpYa3lNREU0SWl3aWNIVmliR2xqUzJWNVVHVnRJam9pTFMwdExTMUNSVWRKVGlCUVZVSk1TVU1nUzBWWkxTMHRMUzFjYmsxSlNVSkpha0ZPUW1kcmNXaHJhVWM1ZHpCQ1FWRkZSa0ZCVDBOQlVUaEJUVWxKUWtOblMwTkJVVVZCYWl0MVYwRnpaSE5OV21oSUswUkZPV1F3U21WY2JtdGxTalpIVm14aU9FTXdkRzUyVkN0M1Z6bDJUa3BvWnk5YVlqTnhjMVF3UlU1c2FUZEhURVoyYlRoM1UwVjBOakZPWnpoWWREaE5LM2wwUTI1eFVWQmNiaXRUY1V0SGVEVm1aSEpEWlVWM1VqQkhNblI2YzFWdk1rSTBMMGd6UkVWd05EVTJOVFpvUWt0MGRUQmFaVlJzT0ZwblprTkxiRmxrUkhSMGIwUlhiWEZjYmtOSU0xTkljbkZqYlhwc1ZtTllNM0J1UlRCQlVtdFFNblJ5U0U5RVVVUndXREZuUmtZM1EzUXZkVko1UlhCd2NHeExNbU12VTJ0RmJGWjFRVVExWXpOY2JrcFlNbmQ0T0RGa2RqZFZhbWh6WlRkYVMxZzVWVVZLTVVadGNsTmhMMDh6U21wa1QxTmhOUzlvU3pBdmIxSkliVUpFU3pRMlVrMWtjamswVXpjdlIxVmNibm94U1RKaGEwZE5hMU40ZWtKTlNrVjNPWGRZWkRBeFIwcFlkeXRZZGpoVWEwWkdOV0ZsSzJsUk1FazNhR3R5ZDNjNGVDdEhPVVZSUTFKTGVXeFdPSGRjYm1OM1NVUkJVVUZDWEc0dExTMHRMVVZPUkNCUVZVSk1TVU1nUzBWWkxTMHRMUzBpZlYwc0ltRjFkR2hsYm5ScFkyRjBhVzl1SWpwYklpTndjbWx0WVhKNUlpd2lJM05sWTI5dVpHRnllU0pkTENKaGMzTmxjblJwYjI1TlpYUm9iMlFpT2xzaUkzQnlhVzFoY25raUxDSWpjMlZqYjI1a1lYSjVJbDE5Iiwic2lnbmF0dXJlIjoiMGdoR2VFYWVjSHN4LVJSeTFWLWdHcWlSX0kwaU5iSjRXdW1NNEN1bW1Xa0NySU5SMGpzZ0djN3IzRDdVWGk5UDNpMnBhaXJ0NEFmS25TWkZBbUxkUWcifQ'

const issuerPrivateKey = '5UhcaoB1QXe9tqtd4oBK3uRKnLJujtAKGwUL9TrtHsza'
const issuerPublicKey =
  '23w1ANHcQuBFuypNFxvegYtyHMSjN6jdtGJa1x5vjFNZKyLGhw8dyuPPJsfqW5rWx94UuibYqEhUzP9FUjPHf696CMXffeSJLzZu3hReHRzNtg1wUu9VGMdiCJmfSdyL6xqQ'
const issuerDid =
  'did:elem:EiDrghZ9dojxx1yoypSaoEKsulNF43b1w_AkVu2xhMQm3Q;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVlUTXdORGN3WVRjeFkySXdPRGt3T0RSaVlUVTJabVEzTURWaFlqWmpNelExTlRBMk9HWmhaRGt5WlRBek1tRTNOak16TkRBeFpEaGhPVEF3TmpBMlpDSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpNMk0ySmtORFZoTldWaVkyWXdaV1ZqTjJZMFpEQTFaRGt6TnpCak16TTRPVGxrTkRVNE1qQmhZalEzWXpGa1ptRmlNek16WlRnd01HWmpZMk0xTURNaWZTeDdJbWxrSWpvaUkySmljeUlzSW5SNWNHVWlPaUpDYkhNeE1qTTRNVWN5UzJWNU1qQXlNQ0lzSW5WellXZGxJam9pYzJsbmJtbHVaeUlzSW5CMVlteHBZMHRsZVVKaGMyVTFPQ0k2SWpJemR6RkJUa2hqVVhWQ1JuVjVjRTVHZUhabFoxbDBlVWhOVTJwT05tcGtkRWRLWVRGNE5YWnFSazVhUzNsTVIyaDNPR1I1ZFZCUVNuTm1jVmMxY2xkNE9UUlZkV2xpV1hGRmFGVjZVRGxHVldwUVNHWTJPVFpEVFZobVptVlRTa3g2V25VemFGSmxTRko2VG5Sbk1YZFZkVGxXUjAxa2FVTktiV1pUWkhsTU5uaHhVU0o5WFN3aVlYVjBhR1Z1ZEdsallYUnBiMjRpT2xzaUkzQnlhVzFoY25raUxDSWpZbUp6SWwwc0ltRnpjMlZ5ZEdsdmJrMWxkR2h2WkNJNld5SWpjSEpwYldGeWVTSXNJaU5pWW5NaVhYMCIsInNpZ25hdHVyZSI6IlNVTEJKMWw3UG9CSFhFOGZXSzd5RHBsNmIzSEg2YmotR0pzM2tGNVNVaFVBcjUxSFhxSEFrN3p0OVZEM3RScHl3WHJnd1NuODZNbVdZSUNKVGNrcFRBIn0'
const issuerDidDocument = {
  '@context': 'https://w3id.org/security/v2',
  publicKey: [
    {
      id: 'did:elem:EiDrghZ9dojxx1yoypSaoEKsulNF43b1w_AkVu2xhMQm3Q#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '02a30470a71cb089084ba56fd705ab6c3455068fad92e032a7633401d8a900606d',
    },
    {
      id: 'did:elem:EiDrghZ9dojxx1yoypSaoEKsulNF43b1w_AkVu2xhMQm3Q#recovery',
      usage: 'recovery',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '03363bd45a5ebcf0eec7f4d05d9370c33899d45820ab47c1dfab333e800fccc503',
    },
    {
      id: 'did:elem:EiDrghZ9dojxx1yoypSaoEKsulNF43b1w_AkVu2xhMQm3Q#bbs',
      type: 'Bls12381G2Key2020',
      usage: 'signing',
      publicKeyBase58:
        '23w1ANHcQuBFuypNFxvegYtyHMSjN6jdtGJa1x5vjFNZKyLGhw8dyuPPJsfqW5rWx94UuibYqEhUzP9FUjPHf696CMXffeSJLzZu3hReHRzNtg1wUu9VGMdiCJmfSdyL6xqQ',
    },
  ],
  authentication: [
    'did:elem:EiDrghZ9dojxx1yoypSaoEKsulNF43b1w_AkVu2xhMQm3Q#primary',
    'did:elem:EiDrghZ9dojxx1yoypSaoEKsulNF43b1w_AkVu2xhMQm3Q#bbs',
  ],
  assertionMethod: [
    'did:elem:EiDrghZ9dojxx1yoypSaoEKsulNF43b1w_AkVu2xhMQm3Q#primary',
    'did:elem:EiDrghZ9dojxx1yoypSaoEKsulNF43b1w_AkVu2xhMQm3Q#bbs',
  ],
  id: 'did:elem:EiDrghZ9dojxx1yoypSaoEKsulNF43b1w_AkVu2xhMQm3Q',
}

const documentLoader = async (url: string): Promise<any> => {
  if (url.startsWith(toShortDid(issuerDid))) {
    return {
      contextUrl: null,
      document: issuerDidDocument,
      documentUrl: url,
    }
  }

  return jsonld.documentLoaders.node()(url)
}

const getSignSuite: GetSignSuiteFn = async ({ controller, keyId, privateKey, publicKey }) => {
  if (!publicKey) {
    throw new Error('Public key is required for signing with BBS+')
  }

  return new BbsBlsSignature2020({
    key: new Bls12381G2KeyPair({
      id: keyId,
      controller,
      publicKeyBase58: publicKey,
      privateKeyBase58: privateKey,
    }),
  })
}

const getVerifySuite: GetVerifySuiteFn = async ({ controller, verificationMethod }) => {
  const didDoc = (await documentLoader(controller)).document
  const publicKey = didDoc.publicKey.find(({ id }: any) => id === verificationMethod)

  return new BbsBlsSignature2020({
    key: new Bls12381G2KeyPair({
      publicKeyBase58: publicKey.publicKeyBase58,
      id: verificationMethod,
      controller,
    }),
  })
}

const createVC = async (): Promise<VCV1> => {
  return buildVCV1({
    compactProof: true,
    unsigned: buildVCV1Unsigned({
      skeleton: buildVCV1Skeleton({
        id: 'claimId:63b5d11c0d1b5566',
        credentialSubject: {
          data: {
            '@type': ['Person', 'PersonE', 'NamePerson'],
            givenName: 'Jon Smith',
            fullName: 'Jon Family-Man Smith',
          },
        },
        holder: {
          id: holderDid,
        },
        type: 'NameCredentialPersonV1',
        context: [
          'https://w3id.org/security/bbs/v1',
          {
            NameCredentialPersonV1: {
              '@id': 'https://schema.affinity-project.org/NameCredentialPersonV1',
              '@context': { '@version': 1.1, '@protected': true },
            },
            data: {
              '@id': 'https://schema.affinity-project.org/data',
              '@context': [
                null,
                {
                  '@version': 1.1,
                  '@protected': true,
                  '@vocab': 'https://schema.org/',
                  NamePerson: {
                    '@id': 'https://schema.affinity-project.org/NamePerson',
                    '@context': {
                      '@version': 1.1,
                      '@protected': true,
                      '@vocab': 'https://schema.org/',
                      name: 'https://schema.org/name',
                      givenName: 'https://schema.org/givenName',
                      fullName: 'https://schema.org/fullName',
                    },
                  },
                  PersonE: {
                    '@id': 'https://schema.affinity-project.org/PersonE',
                    '@context': { '@version': 1.1, '@protected': true, '@vocab': 'https://schema.org/' },
                  },
                  OrganizationE: {
                    '@id': 'https://schema.affinity-project.org/OrganizationE',
                    '@context': {
                      '@version': 1.1,
                      '@protected': true,
                      '@vocab': 'https://schema.org/',
                      hasCredential: 'https://schema.org/hasCredential',
                      industry: 'https://schema.affinity-project.org/industry',
                      identifiers: 'https://schema.affinity-project.org/identifiers',
                    },
                  },
                  Credential: {
                    '@id': 'https://schema.affinity-project.org/Credential',
                    '@context': {
                      '@version': 1.1,
                      '@protected': true,
                      '@vocab': 'https://schema.org/',
                      dateRevoked: 'https://schema.affinity-project.org/dateRevoked',
                      recognizedBy: 'https://schema.affinity-project.org/recognizedBy',
                    },
                  },
                  OrganizationalCredential: {
                    '@id': 'https://schema.affinity-project.org/OrganizationalCredential',
                    '@context': {
                      '@version': 1.1,
                      '@protected': true,
                      '@vocab': 'https://schema.org/',
                      credentialCategory: 'https://schema.affinity-project.org/credentialCategory',
                      organizationType: 'https://schema.affinity-project.org/organizationType',
                      goodStanding: 'https://schema.affinity-project.org/goodStanding',
                      active: 'https://schema.affinity-project.org/active',
                      primaryJurisdiction: 'https://schema.affinity-project.org/primaryJurisdiction',
                      identifier: 'https://schema.org/identifier',
                    },
                  },
                },
              ],
            },
          },
        ] as any,
      }),
      issuanceDate: '2021-03-01T07:06:35.403Z',
      expirationDate: '2031-01-16T07:06:35.337Z',
    }),
    issuer: {
      did: issuerDid,
      keyId: `${toShortDid(issuerDid)}#bbs`,
      privateKey: issuerPrivateKey,
      publicKey: issuerPublicKey,
    },
    documentLoader,
    getSignSuite,
  })
}

const getProofPurposeOptions: GetVerifierProofPurposeOptionsFn = async ({ proofPurpose }) => {
  if (proofPurpose === 'assertionMethod') {
    return {
      controller: issuerDidDocument,
    }
  }

  throw new Error(`Unsupported proofPurpose: ${proofPurpose}`)
}

const expectToBeInvalidWith = <T>(res: Validatied<T>, ...errors: ErrorConfig[]) => {
  expect(res.kind).toBe('invalid')
  if (res.kind === 'invalid') {
    for (const error of errors) {
      expect(res.errors).toContainEqual(error)
    }
  }
}

describe('validateVCV1 [BBS+]', () => {
  it('validates a valid VC', async () => {
    const vc = await createVC()

    const res = await validateVCV1({
      documentLoader,
      getVerifySuite,
      getProofPurposeOptions,
      compactProof: true,
    })(vc)

    if (res.kind === 'invalid') {
      res.errors.map(({ kind, message }) => console.log(`${kind}: ${message}`))
    }

    expect(res.kind).toEqual('valid')
  })

  describe('[proof validation]', () => {
    it('should fail when "proofValue" is empty', async () => {
      const vc = await createVC()

      vc.proof.proofValue = ''

      const res = await validateVCV1({ documentLoader, getVerifySuite, compactProof: true })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "proofValue": Expected non empty string',
      })
    })

    it('should fail when "proofValue" is not provided', async () => {
      const vc = await createVC()

      delete vc.proof.proofValue

      const res = await validateVCV1({ documentLoader, getVerifySuite, compactProof: true })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:' +
          '\ninvalid_param: Invalid value for field "jws": Expected to be typeof: "string"' +
          '\ninvalid_param: Invalid value for field "proofValue": Expected to be typeof: "string"',
      })
    })
  })
})
