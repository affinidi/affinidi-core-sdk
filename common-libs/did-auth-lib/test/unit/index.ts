import { config } from 'dotenv'
config()

require('./DidAuthService/DidAuthRequestToken.test')
require('./DidAuthService/DidAuthResponseToken.test')
require('./DidAuthService/DidAuthService.test')
