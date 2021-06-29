const Session = 'dummy_session'

const cognitoInitiateCustomAuthResponse = {
  ChallengeName: 'CUSTOM_CHALLENGE',
  Session,
  ChallengeParameters: {
    USERNAME: 'user@email.com',
    email: 'user@email.com',
  },
}

export default cognitoInitiateCustomAuthResponse
