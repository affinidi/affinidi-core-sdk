import { SUPPORTED_DID_METHODS } from './_defaultConfig'

export const validateDidMethodSupported = (didMethod: string) => {
  if (!SUPPORTED_DID_METHODS.includes(didMethod)) {
    throw new Error(`${didMethod} is not supported did method, supported: ${SUPPORTED_DID_METHODS.toString()}`)
  }
}

export const stipParamsFromDidUrl = (did: string): string =>
  did
    // Strip out matrix params
    .replace(/;[a-zA-Z0-9_.:%-]+=[a-zA-Z0-9_.:%-]*/g, '')
    // Strip out query params
    .replace(/([?][^#]*)?/g, '')
