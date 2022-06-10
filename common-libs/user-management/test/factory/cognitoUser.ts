import { REGISTRATION_STATUS_ATTRIBUTE } from '../../src'
import { RegistrationStatus } from '../../dist'

export const cognitoUserWithIncompleteRegistration = {
  UserAttributes: [
    {
      Name: REGISTRATION_STATUS_ATTRIBUTE,
      Value: RegistrationStatus.Incomplete,
    },
  ],
}

export const cognitoUserWithCompleteRegistration = {
  UserAttributes: [
    {
      Name: REGISTRATION_STATUS_ATTRIBUTE,
      Value: RegistrationStatus.Complete,
    },
  ],
}

export const cognitoUserWithoutRegistrationStatus = {
  UserAttributes: [{}],
}
