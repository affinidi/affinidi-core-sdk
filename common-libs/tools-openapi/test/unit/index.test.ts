import 'mocha'
import fetch from 'node-fetch'
import { setFetchImpl } from '@affinidi/platform-fetch'
setFetchImpl(fetch)

require('./helpers')
