import SdkError from '../../src/SdkError'
import { expect } from 'chai'
import {before} from "mocha";

describe('SdkError', () => {
  describe('#renderMessage', () => {
    it('replaces template variables with values from context', async () => {
      const currentDate = new Date().toISOString()

      const context = {
        mop: 'res',
        number: 12345,
        dateTime: currentDate,
      }

      const message = 'foo {{mop}} {{mop}} bar {{baz}}, {{number}} {{dateTime}}'
      const result = SdkError.renderMessage(message, context)

      expect(result).to.eq(`foo res res bar ${SdkError.undefinedContextVariable}, ${context.number} ${currentDate}`)
    })

    it('returns template if it does not contain any variables', async () => {
      const currentDate = new Date().toISOString()

      const context = {
        mop: 'res',
        number: 12345,
        dateTime: currentDate,
      }

      const message = 'foo bar baz'
      const result = SdkError.renderMessage(message, context)

      expect(result).to.eq('foo bar baz')
    })
  })
})
