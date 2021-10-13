'use strict'

import nock from 'nock'
import sinon from 'sinon'

import { KeysService } from '@affinidi/common'
import { DidAuthAdapter } from '@affinidi/internal-api-clients'

import { generateTestDIDs } from '../../factory/didFactory'
import platformCryptographyTools from '../../../../node/src/PlatformCryptographyTools'
import { expect } from 'chai'
import signedCredential from '../../factory/signedCredential'
import { extractSDKVersion } from '../../../src/_helpers'

import { MigrationHelper, VAULT_MIGRATION_SERVICE_URL } from '../../../src/migration/credentials'
import { DidAuthService } from '../../../src/migration/credentials/DidAuthService'

let encryptionKey: string
let encryptedSeed: string
let didEth: string
let audienceDid: string
const reqheaders: Record<string, string> = {}

const migrationTestCredentials = [
  { bloomId: 42, ...signedCredential, id: '0' },
  { bloomId: 43, ...signedCredential, type: ['type1'], id: '1' },
]

const createEncryptedCreds = (count: number) => {
  return Array(count).fill({
    bloomVaultIndex: 42,
    id: 'b6e10589fe12a52511bce82ce947bef1d5e5ec2c075a498d8a85495760fe6f00',
    types: [
      'faa7c69c138e9ef1f9806eddaaebc9f9abec5f47f0e27055ae383b87f5838fca',
      '799539d8ffa7be3cbcff2024e488dbb66d782357fe667761c062c7380af203b5',
    ],
    payload:
      '{"iv":"0c19a12f038ba1286e236ca49129517d","ephemPublicKey":"043207ce3042594fb438d09d43ed7c3e130eace11a0400144180df81954df04110f5bf52c5fdf56c9de532d504da7465892dc03ecc0ae7b8c965bf0472b2cc3d66","ciphertext":"66e929eeb8b95474b8ebeb4609924c7d40ed41d239b566cebdc065e65b5c69c3522bf5e2a1d0c1365dba06ff528f7f2d0a4a7ff0011cd243b79e7faec8bf5b428e4e537f3032ffdb0a9a0ac8ca7f1c7cac3680ccd9da8e998ce2a9b84fe46b833882f4633f76d99645de47b3b532ca9b2c5328450767d0124c27edb8b09efa99a90d501a081fde502b7bdc08c6fa418b6903d3f437c33306cacf26f5a3eaa4979dcb4038f75475190511dffd512c6a970b1dd0ca391412f169eab4de8a31000dad6acb8b4237f28d6d485c27bffdc82904980efddd5eebeb8ac03e4968841e983080ff561776f34692fb75d3c31d744ba6b9742882e851701a3b028d95310d99d14e5a5635161938ea71d0974a0d264223a38518d1275ebdefb00b9e4e837a9508a33fdc79bb022a24e847a1bf7591a930e206d158c50408ffe85662da15a9a846d4e721638ed3ca0b2f02859f518192a795fad967bb4f9d0dba575ac0cb91a9ad7905ccc7dbf69aff2add36c8f387e825663aa7095ed008b07c12dc220df6c661d361038e138c2ec374674a6a885f76995de34d9380be2cea68b079537c4efa42c4c86fe4eab9c59c4995d5d5f60eb8ba8f1816500ab4eaf73766531ed1b171a55aede9c10783b61dedadbeffca1da3faf59f9b1ea5bf382f04715c338fb06cc90adc7215e71f15e4be37dffe72d33a907698bf85b7ab401950a61c43ca17124d5161da0e615d45aa3b339453018ec98764e5125f93aae1b63afb43d0f4ad7292154ce244dec66249292578e202572117944714a630c4d78eae3d9282c7ee1bcdec3b1a5a6f060c2338694ee5656c276d1e9e812444ccf0bc0079a7bea4d0097a2698bf9f0150dacabb62aa74b86a376a8b0be341e8557da717cde130bfda200444cf53bd0273ce82bc98c49d25cb80cd1647a9209dddaee71201f7aae8f7f466fcb87ac78541c12807d993012bbe90c15980f3d88f6ebd5623532c458ca5154cc6c0d5f169233981417d2fce93b9595c17302b34421d7ce9da452283d5a700cacee802f6fd23e1768ed516cf8fe53a4645972115d8079e0f375d426d3efea23eea0aec501a1ff2862fe0b071644b4ef26eec6f631d7439009915878936f42636f06a51458cc29f9cadb401d95e0db60f194c6061376185cdb64c5b637c78e26afb3aa7198c0a5e707b3bd7e015995f652834e232b3eb87451e5f902c16e7265febe8ffec4a7d35ce08b7185eca17c6ce2ac28f82daa6d445589ea7138e2c6f5b313cae36d127c1076e342307586f1b9a3f39339692837051a440592dba0229adbad17720b36e83d77ffcc4fe0a67d41ab9188eb26d7ef0c4f4496eb1bdcdbc89d827c04aa4da37cf9a3d6308e9a1d8ec4fa88baf37cfaa2750afb0faae311f16373b4b8fe61adcc8379e9e9ad0860c56440c78bbcd3e6ed36bf24d47ac0053d6806fc39bfc43b51e5c833e331da7698d50466d252dc9d94a4429652f5c2067b2ab71270ff2170acb15f4ef5899d1180b3851fd9a9536fe3c491e261626a83c8e320a14ca8c5c4225c73c7be656b6e2e8de5e744c493d790c03c362e0377ac2d0d87faed29de78502d750cb0f23a01686a3fd1c55ae481657b8785007d0d5a5e6dbe0b87dc16766f7423f6328ef3b1e473f3b2c6cb25b77587a842ab077deec336fcdea55e61dbf121dd7bb3f2f0904697332fea195aa250e6cd9f501e7992e90cee835626effaf693dcbd1f107299fc8e79837fc46913f381b4571128540ea4d8156f6a7071358c245d4629eb20d1c422281d67aa65e50fe986fcaeabad035ec060efc85253c99995e78c37545ee51937aa0d1afa51fe76943b1c2f242faff1d5e4cef9bd4481d9d95751e3aa92cae7b86a69163de8fad57380613b4e7d4c18e1a1a2504abb5cf11040681dfdc7cd220079008db0e91ff61c9f647baeb33f8193eecd3317dde13dabd85b3a868d2eac7d07de418d81a971f28a7dfb10c4856ab4266f2d8c9fba05ddfca0aa15e2c8c6198ea5f83d931d36670e3706dc5b027adcc99ce7395a6822ba7aab745712c4484754d33266b09256abb59603bb59235983eef2ab7513d305a4f7674b014b1a10d31ee0686be3b5e60b097b137d839b07770b21fb92b72d8a4797c4e7b4d83e46a43a8f1fe05dfac246d2328fb1cdd7f82392a7e2cbcb90f3b40d836030841e4b33903dfbddce308948d979f36d01503b6db1657f9cc7f6470e99fab368952d4b55672af3aa74cc2c2424a3c35894bda6e96628339696304536e18f900fb07e23397d477df6fbd8ae281c9d39f496c3e1c7b81e76c1c48251588064f30a41dc8bd7a483d576f781e8689a15d9aae11c6f38cff751e26fffe5e99ee28078be9fcd15858aadff650f95ea1e2dfd5669a67","mac":"bd3d864c0a011a1b29515525c282ba41ffedccbd76468835d92dbb8c83e911c8"}',
  })
}

const mockAndStubMigrationHelperCalls = () => {
  nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders })
    .get('/api/v1/migrationStatus')
    .reply(200, { status: 'needMigration' })
  nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).post('/api/v1/migrateCredentials').reply(200, {})
  const stubPullDidAuthRequestToken = sinon
    .stub(DidAuthService.prototype, 'pullDidAuthRequestToken')
    .resolves('requestToken')
  const stubCreateDidAuthResponseToken = sinon
    .stub(DidAuthService.prototype, 'createDidAuthResponseToken')
    .resolves('responseToken')
  sinon.stub(MigrationHelper.prototype, 'encryptCredentials').resolves(createEncryptedCreds(1))
  return [stubPullDidAuthRequestToken, stubCreateDidAuthResponseToken]
}

const createMigrationHelper = () => {
  const keysService = new KeysService(encryptedSeed, encryptionKey)
  const didAuthAdapter = new DidAuthAdapter(audienceDid, { encryptedSeed, encryptionKey })
  return new MigrationHelper(didAuthAdapter, undefined, keysService, platformCryptographyTools, didEth)
}

describe('Migration of credentials from `bloom-vault` to `affinidi-vault`', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    encryptionKey = testDids.password
    encryptedSeed = testDids.elem.encryptedSeed
    // fake did:eth seedHex
    didEth = `did:eth:${testDids.jolo.seedHex}`
    audienceDid = testDids.elem.did

    reqheaders['X-SDK-Version'] = extractSDKVersion()
  })

  after(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('Authentication token is not expired: `pullDidAuthRequestToken` and `createDidAuthResponseToken` should called once', async () => {
    const [stubPullDidAuthRequestToken, stubCreateDidAuthResponseToken] = mockAndStubMigrationHelperCalls()
    sinon.stub(DidAuthService.prototype, 'isTokenExpired').returns(false)

    const helper = createMigrationHelper()
    await helper.getMigrationStatus()
    await helper.runMigration([])

    expect(stubPullDidAuthRequestToken.calledOnce).to.be.true
    expect(stubCreateDidAuthResponseToken.calledOnce).to.be.true
  })

  it('Authentication token is expired: `pullDidAuthRequestToken` and `createDidAuthResponseToken` should called twice', async () => {
    const [stubPullDidAuthRequestToken, stubCreateDidAuthResponseToken] = mockAndStubMigrationHelperCalls()
    sinon.stub(DidAuthService.prototype, 'isTokenExpired').returns(true)

    const helper = createMigrationHelper()
    await helper.getMigrationStatus()
    await helper.runMigration([])

    expect(stubPullDidAuthRequestToken.calledTwice).to.be.true
    expect(stubCreateDidAuthResponseToken.calledTwice).to.be.true
  })

  it('`migrateCredentials` should called twice if amount of VCs 150(two chunks)', async () => {
    sinon.stub(MigrationHelper.prototype, 'encryptCredentials').resolves(createEncryptedCreds(150))
    const stubMigrateCredentials = sinon.stub(MigrationHelper.prototype, 'migrateCredentials')
    const helper = createMigrationHelper()
    await helper.runMigration([])

    expect(stubMigrateCredentials.calledTwice).to.be.true
    expect(stubMigrateCredentials.firstCall.args[0].length).to.be.eq(100)
    expect(stubMigrateCredentials.lastCall.args[0].length).to.be.eq(50)
  })

  it('`migrateCredentials` should called once if amount of VCs 10(one chunks)', async () => {
    sinon.stub(MigrationHelper.prototype, 'encryptCredentials').resolves(createEncryptedCreds(10))
    const stubMigrateCredentials = sinon.stub(MigrationHelper.prototype, 'migrateCredentials')
    const helper = createMigrationHelper()
    await helper.runMigration([])

    expect(stubMigrateCredentials.calledOnce).to.be.true
    expect(stubMigrateCredentials.firstCall.args[0].length).to.be.eq(10)
  })

  it('`migrateCredentials` should called 64 times if amount of VCs 6347(64 chunks)', async () => {
    sinon.stub(MigrationHelper.prototype, 'encryptCredentials').resolves(createEncryptedCreds(6347))
    const stubMigrateCredentials = sinon.stub(MigrationHelper.prototype, 'migrateCredentials')
    const helper = createMigrationHelper()
    await helper.runMigration([])

    expect(stubMigrateCredentials.callCount).to.be.eq(64)

    expect(stubMigrateCredentials.firstCall.args[0].length).to.be.eq(100)
    expect(stubMigrateCredentials.lastCall.args[0].length).to.be.eq(47)
  })

  it('`runMigrationByChunk` and `encryptCredentials` should called once', async () => {
    const stubRunMigrationByChunk = sinon.stub(MigrationHelper.prototype, 'runMigrationByChunk')
    const stubEncryptCredentials = sinon
      .stub(MigrationHelper.prototype, 'encryptCredentials')
      .resolves(createEncryptedCreds(1))
    const helper = createMigrationHelper()
    await helper.runMigration([])

    expect(stubRunMigrationByChunk.calledOnce).to.be.true
    expect(stubEncryptCredentials.calledOnce).to.be.true
  })

  it('`encryptCredentials` should return array with length equal to incoming array length', async () => {
    const stub = sinon.stub(MigrationHelper.prototype, 'runMigrationByChunk')
    const helper = createMigrationHelper()
    await helper.runMigration(migrationTestCredentials)

    const encryptionResult = stub.getCalls()[0].args[0]
    expect(encryptionResult.length).to.be.eq(migrationTestCredentials.length)
  })

  it('`encryptCredentials` should return array of VCs with expected structure', async () => {
    const stub = sinon.stub(MigrationHelper.prototype, 'runMigrationByChunk')
    const helper = createMigrationHelper()
    await helper.runMigration(migrationTestCredentials)

    const encryptionResult = stub.getCalls()[0].args[0]
    for (const credential of encryptionResult) {
      const idx = encryptionResult.indexOf(credential)
      expect(credential.bloomVaultIndex).to.be.eq(migrationTestCredentials[idx].bloomId)
      expect(credential.id).to.be.exist
      expect(typeof credential.id).to.be.eq('string')
      expect(credential.types).to.be.exist
      expect(typeof credential.types).to.be.eq('object')
      expect(credential.types.length).to.be.eq(migrationTestCredentials[idx].type.length)
      const payload = credential.payload
      expect(payload).to.be.exist
      expect(typeof payload).to.be.eq('string')
    }
  })

  it('`encryptCredentials` should return decryptable payload(decryption result should be equal to initial data)', async () => {
    const stub = sinon.stub(MigrationHelper.prototype, 'runMigrationByChunk')
    const helper = createMigrationHelper()
    await helper.runMigration(migrationTestCredentials)

    const keysService = new KeysService(encryptedSeed, encryptionKey)
    const privateKeyBuffer = keysService.getOwnPrivateKey()

    const encryptionResult = stub.getCalls()[0].args[0]

    for (const credential of encryptionResult) {
      const idx = encryptionResult.indexOf(credential)
      const payload = credential.payload
      const decryptedPayload = await platformCryptographyTools.decryptByPrivateKey(privateKeyBuffer, payload)
      expect(decryptedPayload).to.deep.eq(migrationTestCredentials[idx])
    }
  })
})
