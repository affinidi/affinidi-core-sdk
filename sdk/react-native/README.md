# Affinity SDK for React Native.

> Please note that versions `>=4.2.6 <=5.0.0` might not work properly (see [this PR](https://github.com/affinityproject/affinidi-core-sdk/pull/105)).
> 
> For `v5`, please use versions `>=5.0.1`.
> 
> For `v4`, please use version `4.2.5` or, even better, update to `v5`.

React Native SDK extends CORE SDK. Make sure to check the [CORE SDK documentation](https://github.com/affinityproject/affinidi-core-sdk/tree/master/sdk/core).

## How to install:

```shell script
npm i --save @affinityproject/affinity-react-native-sdk
```

## Setup Integration Tests

Test credentials should be added to the top level `.env` file. These contain usernames and passwords of pre-populated accounts on the staging environment. Reach out to a team member for instructions on how to set up this file, or to obtain a copy.

## Mapping

You may need some polyfills as some of the dependencies assume running in a Node environment.

```shell script
npm install --save vm-browserify stream-browserify @react-native-community/netinfo \
  react-native-crypto react-native-randombytes react-native-get-random-values \
  amazon-cognito-identity-js assert events
```

Also need to configure your bundler (webpack, parcel, metro, etc.) with aliases for the modules named ..-browserify
in metro.config.js:

```js
module.exports = {
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    extraNodeModules: {
      // Polyfills for node libraries
      mobileRandomBytes: require.resolve('@affinidi/wallet-react-native-sdk/mobileRandomBytes'),
      crypto: require.resolve('react-native-crypto'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
    },
  },
}
```

Add the line below to your `index.js` / `App.js`

```js
import 'react-native-get-random-values'
```

### TextEncoder issue

In case `TextEncoder not found` error for React Native on making bundle,
add the following to your `index.js` or `App.js`:

```js
import * as encoding from 'text-encoding'
```

## Initialize

If you want to specify issuer's URL, pass it in the options.

You should also specify the stack environment to be used in `env` variable.
`env` - (required) is enum which can be `dev` | `staging` | `prod`.

Either `apiKey` or `accessApiKey` should also be passed.

```ts
const options = {
  issuerUrl: 'https://affinity-issuer.staging.affinity-project.org',
  env: 'staging',
  apiKey: '<your sdk api key>',
};

const affinityWallet = new AffinityWallet(password, encryptedSeed, options)
```

### Initialize region for storing credentials

You can specify AWS region where user credentials will be stored using optional
`storageRegion` parameter (region should be a 3 character string correlating to
an Alpha-3 country code).

```ts
const options = {
  storageRegion: 'SGP',
  env: 'dev',
  apiKey: '<your sdk api key>',
}

const affinityWallet = new AffinityWallet(password, encryptedSeed, options)
```

### Initialize from user access token

Returns SDK instance when user is logged in, and throws
`COR-9 / UnprocessableEntityError` if user is logged out.

```ts
import { AffinityWallet } from '@affinidi/wallet-browser-sdk'

const affinityWallet = await AffinityWallet.init(options)
```

`options` - optional, if not defined default settings will be used.

### Create encrypted message

```ts
const encryptedMessage = await affinityWallet.createEncryptedMessage(toDid, object)
```

`toDid` - DID, string value of document to be resolved.

`object` - value to be encrypted by public key.

### Read encrypted message

```ts
const message = await affinityWallet.readEncryptedMessage(encryptedMessage)
```

`encryptedMessage` - message to be decrypted.

### Put credential to VC vault

```ts
const credentials = [ signedCredential ]
const storageRegion = 'SGP'

await affinityWallet.saveCredentials(credentials, storageRegion)
```

`credentials` - array of credentials to store in the vault.
`storageRegion` - (optional) AWS region where user's credentials will be stored.
Region should be a 3 character string correlating to an Alpha-3 country code.

### Pull credential from VC vault

#### All Credentials Matching the shareRequestToken
```ts
const credentials = await affinityWallet.getCredentials(shareRequestToken)
```

`shareRequestToken` - optional parameter (if passed - returns VC,
which match the request, if not - then returns all VCs).

#### All Credentials
```ts
const credentials = await affinityWallet.getCredentials(null)
```

#### A Single Credential
```ts
const credential = await affinityWallet.getCredentialByIndex(credentialIndex)
```

`credentialIndex` is a required parameter which is type of number.

### Get credential issued during signup process

Behaves the same as the wallet-core-sdk `confirmSignIn` method, but with the added option to issue a VC to the user's vault automatically upon signup with a verified email or phone number.

#### Confirm sign in (if using confirmSignIn for both sign up and login scenarios)

```ts
const options = {
   apiKey: '<your sdk api key>',
   env: 'prod'
 }
const { isNew, commonNetworkMember: affinityWallet } = await AffinityWallet.confirmSignIn(token, confirmationCode, options)
```

`token` - AWS Cognito Access Token

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

`options` - used to specify
   * `env` (mandatory) environment stack (dev | staging | prod). if not defined set to staging.
   * `apiKey` (mandatory) [API Key](https://github.com/affinityproject/affinidi-core-sdk/tree/master/sdk/core#create-api-key)
   * `issueSignupCredential` (optional) if not defined, set to false

Returns `isNew` flag, identifying whether new account was created, and
initialized instance of SDK - `affinityWallet`.

#### Confirm sign up

```ts
const options = {env:'prod', apiKey:'<your_api_key>', issueSignupCredential: true}
const affinityWallet = await AffinityWallet.confirmSignUp(token, confirmationCode, options)
```

`token` - AWS Cognito Access Token

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

`options` - used to specify
   * `env`(optional) environment stack (dev | staging | prod). if not defined set to staging. 
   * `apiKey` (mandatory) [API Key](https://github.com/affinityproject/affinidi-core-sdk/tree/master/sdk/core#create-api-key) 
   * `issueSignupCredential` (optional) if not defined, set to false



#### Delete credential by ID

```ts
await affinityWallet.deleteCredential(credentialId)
```

For example:

```ts
const credentials = await affinityWallet.getCredentials() // get all credentials

const credentialId = ... // select credential which should be deleted, f.e `claimId:12345678`

await affinityWallet.deleteCredential(credentialId)
```
