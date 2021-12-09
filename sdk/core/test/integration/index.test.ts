import 'mocha'
import './env'

import { useNodeFetch } from '@affinidi/platform-fetch-node'
useNodeFetch()

require('./migration')
require('./services')
require('./AffinityWallet.test')
require('./NetworkMember.test')
require('./otp/index.test')
require('./otp-legacy/index.test')
