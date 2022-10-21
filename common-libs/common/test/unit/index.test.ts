import 'mocha'

import { useNodeFetch } from '@affinidi/platform-fetch-node'
import { config } from 'dotenv'

config()
useNodeFetch()

require('./_baseDocumentLoader.test')
require('./Affinity.test')
require('./services')
require('./shared')
require('./utils')
