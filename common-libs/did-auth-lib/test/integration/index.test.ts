import { config } from 'dotenv'
config()

import { useNodeFetch } from '@affinidi/platform-fetch-node'
useNodeFetch()

const DidAuthServiceTest = require('./DidAuthService/DidAuthService.test')

describe('Integration tests', () => {
  DidAuthServiceTest()
})
