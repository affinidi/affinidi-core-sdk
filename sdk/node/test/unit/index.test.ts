import 'mocha'

import { useNodeFetch } from '@affinidi/platform-fetch-node'

useNodeFetch()

require('./PlatformCryptographyTools.test')
require('./vc-signatures.test')
