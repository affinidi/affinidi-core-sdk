import SdkError from '../shared/SdkError'
import { CognitoUserTokens } from '../dto/shared.dto'

let tempSessionStorage: any = {}

// NOTE: isBrowser is defined in this way because in EXPO
//       typeof document === object
//       typeof window === object
const isBrowser = typeof navigator !== 'undefined' && navigator.product !== 'ReactNative'

const isTestEnvironment = process.env.NODE_ENV === 'test'

export function readUserTokensFromSessionStorage(userPoolId: string): CognitoUserTokens {
  const sessionStorageKey = userPoolId

  let sessionStorageObject

  if (isBrowser) {
    sessionStorageObject = window.sessionStorage.getItem(sessionStorageKey)
  }

  if (isTestEnvironment) {
    sessionStorageObject = tempSessionStorage[sessionStorageKey]
  }

  if (!sessionStorageObject) {
    throw new SdkError('COR-9')
  }

  return JSON.parse(sessionStorageObject)
}

export function saveUserTokensToSessionStorage(userPoolId: string, cognitoUserTokens: CognitoUserTokens): void {
  const sessionStorageKey = userPoolId
  const sessionStorageObject = JSON.stringify(cognitoUserTokens)

  if (isBrowser) {
    window.sessionStorage.setItem(sessionStorageKey, sessionStorageObject)
  }

  if (isTestEnvironment) {
    tempSessionStorage[sessionStorageKey] = sessionStorageObject
  }
}

export function clearUserTokensFromSessionStorage(userPoolId: string): void {
  const sessionStorageKey = userPoolId

  if (isBrowser) {
    window.sessionStorage.removeItem(sessionStorageKey)
  }

  if (isTestEnvironment) {
    tempSessionStorage = {}
  }
}
