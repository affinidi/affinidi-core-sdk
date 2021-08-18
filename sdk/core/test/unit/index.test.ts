import 'mocha'

import { config } from 'dotenv'
config()

require('./AffinityWallet.test')
require('./CommonNetworkMember.test')
require('./Util.test')
require('./shared')
require('./services')
