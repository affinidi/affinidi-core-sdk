# Affinity SDK for React Native.

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

### Initialize region for storing credentials

You can specify AWS region where user credentials will be stored using optional
`storageRegion` parameter (region should be a 3 character string correlating to
an Alpha-3 country code).

```ts
const options = {
  storageRegion: 'SGP'
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
const encryptedMessage = await commonNetworkMember.createEncryptedMessage(toDid, object)
```

`toDid` - DID, string value of document to be resolved

`object` - value to be encrypted by public key

### Read encrypted message

```ts
const message = await commonNetworkMember.readEncryptedMessage(encryptedMessage)
```

`encryptedMessage` - message to be decrypted

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

```ts
const credentials = await wallet.getCredentials(shareRequestToken)
```

`shareRequestToken` - optional parameter (if passed - returns VC,
which match the request, if not - then returns all VCs).

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
