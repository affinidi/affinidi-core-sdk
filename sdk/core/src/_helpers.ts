import { SUPPORTED_DID_METHODS } from './_defaultConfig'
import SdkErrorFromCode from './shared/SdkErrorFromCode'
import { CredentialLike, W3cCredentialLike } from './dto/internal'
import { DidMethod } from './dto/shared.dto'

const packageInfo = require('../package.json')

export const validateDidMethodSupported = (didMethod: DidMethod) => {
  if (!SUPPORTED_DID_METHODS.includes(didMethod)) {
    throw new SdkErrorFromCode('COM-10', {
      didMethod: didMethod,
      supportedDidMethods: SUPPORTED_DID_METHODS.join(', '),
    })
  }
}

export const stripParamsFromDidUrl = (did: string): string =>
  did
    // Strip out matrix params
    .replace(/;[a-zA-Z0-9_.:%-]+=[a-zA-Z0-9_.:%-]*/g, '')
    // Strip out query params
    .replace(/([?][^#]*)?/g, '')

export function isW3cCredential(credential: CredentialLike): credential is W3cCredentialLike {
  return !!credential.type
}

export const extractSDKVersion = (): string => packageInfo.version
