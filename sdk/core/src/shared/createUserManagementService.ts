import { DEFAULT_COGNITO_REGION } from '../_defaultConfig'
import { extractSDKVersion } from '../_helpers'
import { KeyStorageApiService } from '@affinidi/internal-api-clients'
import { UserManagementService } from '@affinidi/user-management'

type InputOptions = {
  region?: string
  shouldDisableNameNormalisation?: boolean
  accessApiKey: string
  basicOptions: {
    keyStorageUrl: string
    clientId: string
    userPoolId: string
  }
}

export const createUserManagementService = (options: InputOptions): UserManagementService => {
  const keyStorageApiService = new KeyStorageApiService({
    keyStorageUrl: options.basicOptions.keyStorageUrl,
    accessApiKey: options.accessApiKey,
    sdkVersion: extractSDKVersion(),
  })

  return new UserManagementService(
    {
      region: options.region ?? DEFAULT_COGNITO_REGION,
      shouldDisableNameNormalisation: options.shouldDisableNameNormalisation,
      ...options.basicOptions,
    },
    { keyStorageApiService },
  )
}
