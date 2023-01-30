import { REGISTRATION_STATUS_ATTRIBUTE, RegistrationStatus } from '../../src'

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
