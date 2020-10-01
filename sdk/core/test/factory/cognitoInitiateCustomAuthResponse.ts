const Session = 'dummy_session'

const cognitoInitiateCustomAuthResponse: any = {
  ChallengeName: 'CUSTOM_CHALLENGE',
  Session,
  ChallengeParameters: {
    USERNAME: 'user@email.com',
    email: 'user@email.com',
  },
}

module.exports = cognitoInitiateCustomAuthResponse
