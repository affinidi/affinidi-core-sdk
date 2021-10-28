import { CognitoUserTokens } from '../dto/shared.dto'
import SdkErrorFromCode from './SdkErrorFromCode'

let tempSessionStorage: any = {}

// NOTE: isBrowser is defined in this way because in EXPO
//       typeof document === object
//       typeof window === object
const isBrowser = typeof navigator !== 'undefined' && navigator.product !== 'ReactNative'

const isTestEnvironment = process.env.NODE_ENV === 'test'

export class SessionStorageService {
  private readonly _sessionStorageKey

  constructor(sessionStorageKey: string) {
    this._sessionStorageKey = sessionStorageKey
  }

  readUserTokens(): CognitoUserTokens {
    let sessionStorageObject

    if (isBrowser) {
      sessionStorageObject = window.sessionStorage.getItem(this._sessionStorageKey)
    }

    if (isTestEnvironment) {
      sessionStorageObject = tempSessionStorage[this._sessionStorageKey]
    }

    if (!sessionStorageObject) {
      throw new SdkErrorFromCode('COR-9')
    }

    return JSON.parse(sessionStorageObject)
  }

  saveUserTokens(cognitoUserTokens: CognitoUserTokens): void {
    const sessionStorageObject = JSON.stringify(cognitoUserTokens)

    if (isBrowser) {
      window.sessionStorage.setItem(this._sessionStorageKey, sessionStorageObject)
    }

    if (isTestEnvironment) {
      tempSessionStorage[this._sessionStorageKey] = sessionStorageObject
    }
  }

  clearUserTokens(): void {
    if (isBrowser) {
      window.sessionStorage.removeItem(this._sessionStorageKey)
    }

    if (isTestEnvironment) {
      tempSessionStorage = {}
    }
  }
}
