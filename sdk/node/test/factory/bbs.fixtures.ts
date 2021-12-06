import { buildVCV1Unsigned, buildVCV1Skeleton, VCV1Type } from '@affinidi/vc-common'
import { getVCNamePersonV1Context } from '@affinidi/vc-data'

export const holderDid =
  'did:elem:EiBPOmOmRgCcopkf_E1kiyNlMOOJ-MT5IaMpQTZud8Wycw;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVkySTBPVFl3Tm1FeU5EVTFZamt4T1RGa05qaGpZek5rTVdOa1ltUmhZVEpsTm1Oa05UZzNOVGxsWXpaa05HTXpaamM0Tm1VMU1HTTVOemt5Tm1Gall5SjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpVeE0yWTBNekk0WVdZM01UWXhZVGN5WTJObVpqTmhORFkwTXpJM00yTTBNakpsTVdZd1ltVTNOV1ptTnpneE5qWTRZak14WTJJME0yVmxPVFJsWTJJaWZTeDdJbWxrSWpvaUkzTmxZMjl1WkdGeWVTSXNJblZ6WVdkbElqb2ljMmxuYm1sdVp5SXNJblI1Y0dVaU9pSlNjMkZXWlhKcFptbGpZWFJwYjI1TFpYa3lNREU0SWl3aWNIVmliR2xqUzJWNVVHVnRJam9pTFMwdExTMUNSVWRKVGlCUVZVSk1TVU1nUzBWWkxTMHRMUzFjYmsxSlNVSkpha0ZPUW1kcmNXaHJhVWM1ZHpCQ1FWRkZSa0ZCVDBOQlVUaEJUVWxKUWtOblMwTkJVVVZCYWl0MVYwRnpaSE5OV21oSUswUkZPV1F3U21WY2JtdGxTalpIVm14aU9FTXdkRzUyVkN0M1Z6bDJUa3BvWnk5YVlqTnhjMVF3UlU1c2FUZEhURVoyYlRoM1UwVjBOakZPWnpoWWREaE5LM2wwUTI1eFVWQmNiaXRUY1V0SGVEVm1aSEpEWlVWM1VqQkhNblI2YzFWdk1rSTBMMGd6UkVWd05EVTJOVFpvUWt0MGRUQmFaVlJzT0ZwblprTkxiRmxrUkhSMGIwUlhiWEZjYmtOSU0xTkljbkZqYlhwc1ZtTllNM0J1UlRCQlVtdFFNblJ5U0U5RVVVUndXREZuUmtZM1EzUXZkVko1UlhCd2NHeExNbU12VTJ0RmJGWjFRVVExWXpOY2JrcFlNbmQ0T0RGa2RqZFZhbWh6WlRkYVMxZzVWVVZLTVVadGNsTmhMMDh6U21wa1QxTmhOUzlvU3pBdmIxSkliVUpFU3pRMlVrMWtjamswVXpjdlIxVmNibm94U1RKaGEwZE5hMU40ZWtKTlNrVjNPWGRZWkRBeFIwcFlkeXRZZGpoVWEwWkdOV0ZsSzJsUk1FazNhR3R5ZDNjNGVDdEhPVVZSUTFKTGVXeFdPSGRjYm1OM1NVUkJVVUZDWEc0dExTMHRMVVZPUkNCUVZVSk1TVU1nUzBWWkxTMHRMUzBpZlYwc0ltRjFkR2hsYm5ScFkyRjBhVzl1SWpwYklpTndjbWx0WVhKNUlpd2lJM05sWTI5dVpHRnllU0pkTENKaGMzTmxjblJwYjI1TlpYUm9iMlFpT2xzaUkzQnlhVzFoY25raUxDSWpjMlZqYjI1a1lYSjVJbDE5Iiwic2lnbmF0dXJlIjoiMGdoR2VFYWVjSHN4LVJSeTFWLWdHcWlSX0kwaU5iSjRXdW1NNEN1bW1Xa0NySU5SMGpzZ0djN3IzRDdVWGk5UDNpMnBhaXJ0NEFmS25TWkZBbUxkUWcifQ'

export const unsignedCredential = buildVCV1Unsigned({
  skeleton: buildVCV1Skeleton({
    id: 'claimId:63b5d11c0d1b5566',
    credentialSubject: {
      data: {
        '@type': ['Person', 'PersonE', 'NamePerson'],
        givenName: 'DenisUpdated',
        fullName: 'Popov',
      },
    },
    holder: {
      id: holderDid,
    },
    type: 'NameCredentialPersonV1',
    context: getVCNamePersonV1Context(),
  }),
  issuanceDate: '2021-03-01T07:06:35.403Z',
  expirationDate: '2031-01-16T07:06:35.337Z',
})

export const unsignedCredentialWithNewCtx = {
  '@context': ['https://www.w3.org/2018/credentials/v1', 'https://schema.affinidi.com/GoodDeveloperV1-2.jsonld'],
  id: 'claimId:9fea404ee7345748',
  type: ['VerifiableCredential', 'GoodDeveloper'] as VCV1Type,
  holder: {
    id: 'did:elem:EiBPOmOmRgCcopkf_E1kiyNlMOOJ-MT5IaMpQTZud8Wycw',
  },
  credentialSubject: {
    data: {
      '@type': ['VerifiableCredential', 'GoodDeveloper'],
      name: 'Bob Belcher',
      githubLink: 'https://github.com/bobber',
      Influence: {
        area: 'web3',
        level: 'high',
      },
      personal: {
        credo: 'everything that can be decentralized must be decentralized',
      },
    },
  },
  credentialSchema: {
    id: 'https://schema.affinidi.com/GoodDeveloperV1-2.json',
    type: 'JsonSchemaValidator2018',
  },
  issuanceDate: '2021-12-01T08:35:22.817Z',
  expirationDate: '2022-09-10T00:00:00.000Z',
}

export const issuerEncryptionKey = 'O}do-+Y?4e6q`lj_`3$MQw=]M%Kh644b'
export const issuerEncryptedSeed =
  'e8f6e81d134d6c2cb2ea7bbc5f0374199b46e8bf2d5e0d91bbf05432ba2af0e66351c519347337c6c117cbf50f6c7df599096b5b569fd5099b93afb7fc7e48190d9945901de0c0d1aa74b10dfef51634617d54d6ebc940afd61b42e242bcd59b29ed1b9a9edfaa5a943e3c21be19ec9218819db58237960a7dba24ee1eac5ef96ebb34611a5e19115ec0ad0c9e115e50188ef62682fb531464fc09010c1e91d3a606b73ae19dcd7a3a2d552b0fd492d7f8d73172bb1dab4744b22162a2cc76f00b46e7f11635a7f8a3594c820e461380fc82be68a2bf3435f7e1263cc6d6c1323badf963b653f7c2ca3c20ff600d973ea1bc72eadfd1c39dd2ec256bf459224cab4cef25774e0eefe57616d328a7573b3a45517651d612133f8c0e27069ebcf1f1c7b2367891c04583054115c1deb6850af8b6b58d0fd9efcd99cfbe8f45d53b8e0afbd7d19bcc4e825c88ce0333fe26fa506d77fb1c1f8a12b4b301153e7320aa2845fd5d4c7dcf62a65b3555a3431ad80f2c3352bfcbf6216ccd1f8411c028a71e98115458fa13c5910782b1acf089709db77b3b7baddcf4463b478529c5709d847b89b8a63f16e624a1efd036e165c2fb5480f5e34132973105babeb59122'

export const issuerDid =
  'did:elem:EiA9Te5KbXXHTVi1UrfZg9EDAizjl804aUUYESuyainKzQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBek1EZG1ZVFpqWm1OaE9EQTJNMlV6WVdZNVlUTmtaakl3WmpjNU9XTTBOREpsWW1ZMFlqa3pZMlk1TldJNFlqWTFNVGMwTVdGa00yRmpZMk5rWXpBME5DSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1Vek0yUm1PVFl6WmpGbU1XVTRaR1ZsWkRFd09EY3dOR0ZtT0ROallqY3lNakJpWlRZelpUSTVPVEUwTUdSaU16ZzJOVEppTm1VNE9ETXhNVFpsTnpBaWZTeDdJbWxrSWpvaUkySmljeUlzSW5SNWNHVWlPaUpDYkhNeE1qTTRNVWN5UzJWNU1qQXlNQ0lzSW5WellXZGxJam9pYzJsbmJtbHVaeUlzSW5CMVlteHBZMHRsZVVKaGMyVTFPQ0k2SW05eGNGZFpTMkZhUkRsTk1VdGlaVGswUWxaWWNISTRWMVJrUmtKT1dubExkalE0WTNwcFZHbFJWV1YxYUcwM2MwSm9RMEZDVFhsWlJ6UnJZMDF5YzJWRE5qaFpWRVpHWjNsb2FVNWxRa3RxZW1STGF6bE5hVkpYZFV4Mk5VZzBSa1oxYWxGelVVc3lTMVJCZEhwVk9IRlVRbWxhY1VKSVRXMXVURVkwVUV3M1dYUjFJbjFkTENKaGRYUm9aVzUwYVdOaGRHbHZiaUk2V3lJamNISnBiV0Z5ZVNJc0lpTmlZbk1pWFN3aVlYTnpaWEowYVc5dVRXVjBhRzlrSWpwYklpTndjbWx0WVhKNUlpd2lJMkppY3lKZGZRIiwic2lnbmF0dXJlIjoiZjgxRDY5aEs2MGN1WWthbHljVFhldzBIQVE4Uk5BZi02bFY0NzZ6Wk1WWkZxaUNKR0tsckEwU2ZxUmo1QTFDR3M2X0lVckhWaVJhUzRpV0lybC13Z2cifQ'

export const issuerDidDocument = {
  '@context': 'https://w3id.org/security/v2',
  publicKey: [
    {
      id: 'did:elem:EiA9Te5KbXXHTVi1UrfZg9EDAizjl804aUUYESuyainKzQ#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '0307fa6cfca8063e3af9a3df20f799c442ebf4b93cf95b8b651741ad3acccdc044',
    },
    {
      id: 'did:elem:EiA9Te5KbXXHTVi1UrfZg9EDAizjl804aUUYESuyainKzQ#recovery',
      usage: 'recovery',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '02e33df963f1f1e8deed108704af83cb7220be63e299140db38652b6e883116e70',
    },
    {
      id: 'did:elem:EiA9Te5KbXXHTVi1UrfZg9EDAizjl804aUUYESuyainKzQ#bbs',
      type: 'Bls12381G2Key2020',
      usage: 'signing',
      publicKeyBase58:
        'oqpWYKaZD9M1Kbe94BVXpr8WTdFBNZyKv48cziTiQUeuhm7sBhCABMyYG4kcMrseC68YTFFgyhiNeBKjzdKk9MiRWuLv5H4FFujQsQK2KTAtzU8qTBiZqBHMmnLF4PL7Ytu',
    },
  ],
  authentication: [
    'did:elem:EiA9Te5KbXXHTVi1UrfZg9EDAizjl804aUUYESuyainKzQ#primary',
    'did:elem:EiA9Te5KbXXHTVi1UrfZg9EDAizjl804aUUYESuyainKzQ#bbs',
  ],
  assertionMethod: [
    'did:elem:EiA9Te5KbXXHTVi1UrfZg9EDAizjl804aUUYESuyainKzQ#primary',
    'did:elem:EiA9Te5KbXXHTVi1UrfZg9EDAizjl804aUUYESuyainKzQ#bbs',
  ],
  id: 'did:elem:EiA9Te5KbXXHTVi1UrfZg9EDAizjl804aUUYESuyainKzQ',
}
