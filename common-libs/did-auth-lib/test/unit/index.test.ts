import { config } from 'dotenv'
config()

import { useNodeFetch } from '@affinidi/platform-fetch-node'
useNodeFetch()

require('./DidAuthService/DidAuthRequestToken.test')
require('./DidAuthService/DidAuthResponseToken.test')
require('./DidAuthService/DidAuthService.test')
