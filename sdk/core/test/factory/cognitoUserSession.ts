const idToken = 'dummy_token'

const refreshToken = 'dummy_token'

const accessToken = 'dummy_token'

const cognitoUserSession = {
  idToken: {
    jwtToken: idToken,
    payload: {
      sub: '539bb01c-3921-48bb-bd09-94bbf750c420',
      aud: '63u370qajnae4v5m75riqqsr64',
      email_verified: true,
      event_id: 'a86f9946-587b-4b9e-8aac-8cefac8412fd',
      token_use: 'id',
      auth_time: 1591886877,
      iss: 'https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_xQUwVVYnq',
      'cognito:username': 'user_email.com',
      exp: 1591890477,
      iat: 1591886877,
      email: 'user@email.com',
    },
  },
  refreshToken: {
    token: refreshToken,
  },
  accessToken: {
    jwtToken: accessToken,
    payload: {
      sub: '539bb01c-3921-48bb-bd09-94bbf750c420',
      event_id: 'a86f9946-587b-4b9e-8aac-8cefac8412fd',
      token_use: 'access',
      scope: 'aws.cognito.signin.user.admin',
      auth_time: 1591886877,
      iss: 'https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_xQUwVVYnq',
      exp: 1591890477,
      iat: 1591886877,
      jti: '4271c141-137a-466c-a035-a677ea6f9d42',
      client_id: '63u370qajnae4v5m75riqqsr64',
      username: 'user_email.com',
    },
  },
  getAccessToken: () => {
    return {
      getJwtToken: () => {
        return accessToken
      },
    }
  },
  getIdToken: () => {
    return {
      getJwtToken: () => {
        return idToken
      },
    }
  },
  clockDrift: 0,
}

export default cognitoUserSession
