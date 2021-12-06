const Session = 'dummy_session'

export const cognitoInitiateCustomAuthResponse = {
  ChallengeName: 'CUSTOM_CHALLENGE',
  Session,
  ChallengeParameters: {
    USERNAME: 'user@email.com',
    email: 'user@email.com',
  },
}
