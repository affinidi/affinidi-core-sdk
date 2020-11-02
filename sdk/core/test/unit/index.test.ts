import 'mocha'

import { config } from 'dotenv'
config()

require('./CommonNetworkMember.test')
require('./shared')
require('./services')
