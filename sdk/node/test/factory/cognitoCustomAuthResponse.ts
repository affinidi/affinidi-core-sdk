const Session = 'dummy_session'

const cognitoCustomAuthResponse: any = {
  ChallengeName: 'CUSTOM_CHALLENGE',
  Session,
  ChallengeParameters: {
    USERNAME: 'user_email.com',
    email: 'user@email.com',
  },
}

module.exports = cognitoCustomAuthResponse
