import { config } from 'dotenv'
config()

const DidAuthServiceTest = require('./DidAuthService/DidAuthService.test')

describe('Integration tests', () => {
  DidAuthServiceTest()
})
