import SdkError from './SdkError'

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

if (typeof process === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.process = {}
}

if (typeof process.version === 'undefined') {
  global.process.version = ''
}

export { profile, ProfileAction } from './profiler/ProfilerDecorator'
export { SdkError }
