// import { AffinidiWallet, AffinidiWalletV6 } from '../../helpers/AffinidiWallet'
import { expect } from 'chai'
import { getAllOptionsForEnvironment /* testSecrets */ } from '../../helpers'
// import { SignedCredential } from '../../../src/dto'
import { DidAuthAdapter } from '../../../src/shared/DidAuthAdapter'
import { MigrationHelper } from '../../../src/migration/credentials'
import { generateTestDIDs } from '../../factory/didFactory'
import { extractSDKVersion } from '../../../src/_helpers'
import { KeysService, LocalKeyVault } from '@affinidi/common'
import { DidAuthClientService, Signer } from '@affinidi/affinidi-did-auth-lib'
import AffinidiVaultEncryptionService from '../../../src/services/AffinidiVaultEncryptionService'
import { testPlatformTools } from '../../helpers/testPlatformTools'

// const { PASSWORD, ENCRYPTED_SEED_ELEM } = testSecrets

// const password = PASSWORD
// const encryptedSeedElem = ENCRYPTED_SEED_ELEM

const options = getAllOptionsForEnvironment()

let encryptionKey: string
let encryptedSeed: string
let didEth: string
let audienceDid: string
let didDocumentKeyId: string
const reqheaders: Record<string, string> = {}

const createMigrationHelper = () => {
  const keysService = new KeysService(encryptedSeed, encryptionKey)
  const keyVault = new LocalKeyVault(keysService)
  const signer = new Signer({ did: audienceDid, keyId: didDocumentKeyId, keyVault })
  const didAuthService = new DidAuthClientService(signer)
  const didAuthAdapter = new DidAuthAdapter(audienceDid, didAuthService)
  return new MigrationHelper({
    accessApiKey: options.accessApiKey,
    bloomDid: didEth,
    didAuthAdapter,
    encryptionService: new AffinidiVaultEncryptionService(keysService, testPlatformTools),
    migrationUrl: options.migrationUrl,
  })
}

// TODO: commented now and will be removed in the 3 phase of migration (clean up)
// describe.skip('Bloom vault when migration server is UP', () => {
//   let randomCredentials: SignedCredential[]
//
//   before(async () => {
//     const createVCList = (records: number) => {
//       return Array(records)
//         .fill({
//           '@context': [
//             'https://www.w3.org/2018/credentials/v1',
//             {
//               WinnerCredentialPersonV1: {
//                 '@id': 'https://schema.affinity-project.org/WinnerCredentialPersonV1',
//                 '@context': {
//                   '@version': 1.1,
//                   '@protected': true,
//                 },
//               },
//               data: {
//                 '@id': 'https://schema.affinity-project.org/data',
//                 '@context': [
//                   null,
//                   {
//                     '@version': 1.1,
//                     '@protected': true,
//                     '@vocab': 'https://schema.org/',
//                     WinnerPerson: {
//                       '@id': 'https://schema.affinity-project.org/WinnerPerson',
//                       '@context': {
//                         '@version': 1.1,
//                         '@protected': true,
//                         '@vocab': 'https://schema.org/',
//                         medal: 'https://schema.org/medal',
//                       },
//                     },
//                     PersonE: {
//                       '@id': 'https://schema.affinity-project.org/PersonE',
//                       '@context': {
//                         '@version': 1.1,
//                         '@protected': true,
//                         '@vocab': 'https://schema.org/',
//                       },
//                     },
//                     OrganizationE: {
//                       '@id': 'https://schema.affinity-project.org/OrganizationE',
//                       '@context': {
//                         '@version': 1.1,
//                         '@protected': true,
//                         '@vocab': 'https://schema.org/',
//                         hasCredential: 'https://schema.org/hasCredential',
//                         industry: 'https://schema.affinity-project.org/industry',
//                         identifiers: 'https://schema.affinity-project.org/identifiers',
//                       },
//                     },
//                     Credential: {
//                       '@id': 'https://schema.affinity-project.org/Credential',
//                       '@context': {
//                         '@version': 1.1,
//                         '@protected': true,
//                         '@vocab': 'https://schema.org/',
//                         dateRevoked: 'https://schema.affinity-project.org/dateRevoked',
//                         recognizedBy: 'https://schema.affinity-project.org/recognizedBy',
//                       },
//                     },
//                     OrganizationalCredential: {
//                       '@id': 'https://schema.affinity-project.org/OrganizationalCredential',
//                       '@context': {
//                         '@version': 1.1,
//                         '@protected': true,
//                         '@vocab': 'https://schema.org/',
//                         credentialCategory: 'https://schema.affinity-project.org/credentialCategory',
//                         organizationType: 'https://schema.affinity-project.org/organizationType',
//                         goodStanding: 'https://schema.affinity-project.org/goodStanding',
//                         active: 'https://schema.affinity-project.org/active',
//                         primaryJurisdiction: 'https://schema.affinity-project.org/primaryJurisdiction',
//                         identifier: 'https://schema.org/identifier',
//                       },
//                     },
//                   },
//                 ],
//               },
//             },
//           ],
//           id: 'claimId:b8a82aee4ba1d608',
//           type: ['VerifiableCredential', 'WinnerCredentialPersonV1'],
//           holder: {
//             id: 'did:elem:EiBPwZuBLvP-7nFsdrXj2bn_lNWrubbmn2hqnVz8fgBS8w',
//           },
//           credentialSubject: {
//             data: {
//               '@type': ['Person', 'PersonE', 'WinnerPerson'],
//               firstName: 'Alex',
//               lastName: '',
//               participantEmail: 'oleksii.p@affinidi.com',
//               dateOfBirth: '2001-06-22T09:00:00.000Z',
//               eventName: 'Alex Event',
//               eventDescription: 'Alex Description',
//               prizeName: 'Alex Prize Name',
//               prizeCurrency: '',
//               prizeAmount: '',
//               transactionLink: '',
//               otherTeamMembers: '',
//               awardedDate: '2021-06-22T14:54:18.181Z',
//               awardedBy: 'Alex Awarded By',
//               awardeeDescription: '',
//               profileLink: '',
//             },
//           },
//           issuanceDate: '2021-06-22T15:14:02.646Z',
//           issuer:
//             'did:elem:EiD9q0AOA01dlvN46mqBhWsEQqphM0xCTKrBFGWZgmpF5g;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU1tVmxaalptTW1Fd05EWTFaREF6WkRnM05ERTVNbVJpWWpKaU1XTXhOalUxWkdVNU5tRmpZVGcxWkRRMU4yUTBZV0l4WVRabE5tWXpOMll6WlRRd1pDSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1Ka00ySXdaalExT0RCalpUVXhOR1kwTmpCbVpERXlaVEU0TUdVek16TmtOemRtTnpBd01qVXlPV1F3TldOaE5EZG1NR05oT0RFME9EWTBOREZrTTJNaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoielE2QW5JT2dBTkFlY2JWT1g3VUFkX1ZDNUNfSTZZT2p0dHpkM3BFZWVtd2N0RllqNGNTN2hpRHI0VjRnNzNjZ1lRRzAtT3h2TDlNSUtJZzFQNWhMWFEifQ',
//           proof: {
//             type: 'EcdsaSecp256k1Signature2019',
//             created: '2021-06-22T16:05:30Z',
//             verificationMethod: 'did:elem:EiD9q0AOA01dlvN46mqBhWsEQqphM0xCTKrBFGWZgmpF5g#primary',
//             proofPurpose: 'assertionMethod',
//             jws:
//               'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..AGnpOzGP0N9E9A1UTqE08KAhjfZn0yVrnqH5QOQ1cBAyZ13QD-eEvIgNqUbeE9hyYpsVrKVVgNuuTM51TAtclw',
//           },
//         })
//         .map(({ id, ...item }, idx) => {
//           return {
//             ...item,
//             id: `${id}:${idx}`,
//           }
//         })
//     }
//
//     randomCredentials = createVCList(5)
//
//     const commonNetworkMember = new AffinidiWallet(password, encryptedSeedElem, options)
//     await commonNetworkMember.saveCredentials(randomCredentials)
//   })
//
//   after(async () => {
//     const commonNetworkMember = new AffinidiWallet(password, encryptedSeedElem, options)
//     await commonNetworkMember.deleteAllCredentials()
//   })
//
//   it('should getAllCredentials if migration not started and migration service is up', async () => {
//     const commonNetworkMember = new AffinidiWallet(password, encryptedSeedElem, options)
//     const result = await commonNetworkMember.getAllCredentials()
//
//     expect(result).to.eql(randomCredentials)
//   })
//
//   it('should getAllCredentials on v6 wallet', async () => {
//     const commonNetworkMember = await AffinidiWalletV6.openWalletByEncryptedSeed(options, encryptedSeedElem, password)
//     const result = await commonNetworkMember.getAllCredentials()
//
//     expect(result).to.eql(randomCredentials)
//   })
// })

describe('Migration helper works properly', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    encryptionKey = testDids.password
    encryptedSeed = testDids.elem.encryptedSeed
    // fake did:eth seedHex (with wrong format to avoid unexpected write into bloom-vault)
    didEth = `did:eth:${testDids.jolo.seedHex}`
    audienceDid = testDids.elem.did
    didDocumentKeyId = testDids.elem.didDocumentKeyId
    reqheaders['X-SDK-Version'] = extractSDKVersion()
  })

  it('should return actions', async () => {
    const migrationHelper = createMigrationHelper()
    const actions = await migrationHelper.getMigrationActions()

    console.log('result getMigrationActions', actions)

    expect(actions.shouldRunMigration).exist
    expect(typeof actions.shouldRunMigration).to.be.eql('boolean')
    expect(actions.shouldRunMigration).to.be.oneOf([true, false])

    expect(actions.shouldFetchCredentials).exist
    expect(typeof actions.shouldFetchCredentials).to.be.eql('boolean')
    expect(actions.shouldFetchCredentials).to.be.oneOf([true, false])
  })

  it('should check migrateCredentials fails with dummy bloomDid', async () => {
    const migrationHelper = createMigrationHelper()
    try {
      await migrationHelper.migrateCredentials(
        [
          {
            bloomVaultIndex: 5,
            id: 'credential-id',
            types: ['type-1', 'type-2'],
            payload: 'cyphertext',
          },
        ],
        '',
        '',
      )
    } catch (err) {
      expect(err.code).to.be.eql('VMS-4')
    }
  })
})
