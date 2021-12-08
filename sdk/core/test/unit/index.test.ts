import 'mocha'

import { config } from 'dotenv'
config()

import { useNodeFetch } from '@affinidi/platform-fetch-node'
useNodeFetch()

require('./AffinityWallet.test')
require('./CommonNetworkMember.test')
require('./Util.test')
require('./shared')
require('./services')
require('./migration')
