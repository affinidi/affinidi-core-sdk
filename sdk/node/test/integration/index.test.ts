import 'mocha'

import { useNodeFetch } from '@affinidi/platform-fetch-node'

useNodeFetch()

import './env'

require('./vc-signatures.test')
