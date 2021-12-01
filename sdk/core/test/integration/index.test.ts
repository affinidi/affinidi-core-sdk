import 'mocha'
import './env'

require('./migration')
require('./services')
require('./AffinityWallet.test')
require('./NetworkMember.test')
require('./otp/index.test')
require('./otp-legacy/index.test')
