import { SUPPORTED_DID_METHODS } from './_defaultConfig'
import SdkError from './shared/SdkError'

export const validateDidMethodSupported = (didMethod: string) => {
  if (!SUPPORTED_DID_METHODS.includes(didMethod)) {
    throw new SdkError('COM-10', { didMethod: didMethod, supportedDidMethods: SUPPORTED_DID_METHODS })
  }
}

export const stripParamsFromDidUrl = (did: string): string =>
  did
    // Strip out matrix params
    .replace(/;[a-zA-Z0-9_.:%-]+=[a-zA-Z0-9_.:%-]*/g, '')
    // Strip out query params
    .replace(/([?][^#]*)?/g, '')

export function isW3cCredential (credential: any): boolean {
  return !!credential.type
}
