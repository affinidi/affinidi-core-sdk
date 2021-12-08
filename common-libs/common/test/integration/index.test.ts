import 'mocha'
import { useNodeFetch } from '@affinidi/platform-fetch-node'

useNodeFetch()

import { config } from 'dotenv'
config()

require('./Affinity.test')
