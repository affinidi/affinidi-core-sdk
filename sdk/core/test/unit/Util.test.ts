import { expect } from 'chai'

import { Util } from '../../src/CommonNetworkMember/Util'

describe('Util', () => {
  describe('getLoginType', () => {
    const testData = [
      ['test@email.provider', 'email'],
      ['+1234567890', 'phone'],
      ['just-an-username', 'username'],
    ] as const

    testData.forEach(([login, expectedType]) =>
      it(`returns correct type for '${login}'`, () => {
        const type = Util.getLoginType(login)
        expect(type).to.be.equal(expectedType)
      }),
    )
  })
})
