import { EncryptionService } from '../../../src/services/EncryptionService'
import { expect } from 'chai'

describe('KeysService', () => {
  it('should encrypt and decrypt with key', async () => {
    const testValue = '8453938Acf8f3fb41d55c72e553bcc6cbc1f99fdabf724bed2e1fcfdf833de90!'
    const key = '1ad2f0a86119c7bdeccf0edc77e552299de90a5e676017fbf2b6a360198f359e'
    const secret = await EncryptionService.encrypt(testValue, key)
    const decrypted = EncryptionService.decrypt(secret, key)
    expect(testValue).equal(decrypted)
  })
})
