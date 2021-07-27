import { AccountOwnershipV1, getAccountOwnershipV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe.skip('AccountOwnershipV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<AccountOwnershipV1>({
      type: 'AccountOwnershipV1',
      data: {
        // add some data
      },
      context: getAccountOwnershipV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(``)
  })
})
