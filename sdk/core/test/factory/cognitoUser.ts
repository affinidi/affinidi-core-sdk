const cognitoUser = {
  username: 'user@email.com',
  pool: {
    userPoolId: 'dummy_pool',
    clientId: 'dummy_id',
    client: {
      endpoint: 'https://cognito-idp.ap-southeast-1.amazonaws.com/',
      userAgent: 'aws-amplify/0.1.x js',
    },
    advancedSecurityDataCollectionFlag: true,
    storage: (): undefined => undefined,
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Session: null,
  client: {
    endpoint: 'https://cognito-idp.ap-southeast-1.amazonaws.com/',
    userAgent: 'aws-amplify/0.1.x js',
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  signInUserSession: null,
  authenticationFlowType: 'USER_PASSWORD_AUTH',
  storage: {
    setItem: (): undefined => undefined,
    getItem: (): undefined => undefined,
    removeItem: (): undefined => undefined,
    clear: (): undefined => undefined,
  },
  keyPrefix: 'dummy_prefix',
  userDataKey: 'dummy_key',
  setAuthenticationFlowType: (): undefined => undefined,
}

export default cognitoUser
