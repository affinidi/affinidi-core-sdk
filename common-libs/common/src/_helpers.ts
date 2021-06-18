import { SUPPORTED_DID_METHODS } from './_defaultConfig'

export function validateDidMethodSupported(
  didMethod: string,
): asserts didMethod is typeof SUPPORTED_DID_METHODS[number] {
  if (!(SUPPORTED_DID_METHODS as readonly string[]).includes(didMethod)) {
    throw new Error(`${didMethod} is not supported did method, supported: ${SUPPORTED_DID_METHODS.toString()}`)
  }
}

export const stipParamsFromDidUrl = (did: string): string =>
  did
    // Strip out matrix params
    .replace(/;[a-zA-Z0-9_.:%-]+=[a-zA-Z0-9_.:%-]*/g, '')
    // Strip out query params
    .replace(/([?][^#]*)?/g, '')
