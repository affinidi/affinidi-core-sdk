# Affinity SDK for browser

Browser SDK extends CORE SDK. Make sure to check the [CORE SDK documentation](https://www.npmjs.com/package/@affinidi/wallet-core-sdk).

## How to install

```shell script
npm i --save @affinidi/wallet-browser-sdk
```

## Setup Integration Tests

Test credentials should be added to the top level `.env` file. These contain usernames and passwords of pre-populated accounts on the staging environment. Reach out to a team member for instructions on how to set up this file, or to obtain a copy.

## Initialize

If you want to specify issuer's URL, pass it in the options.

You can also specify the stack environment to be used in `env` variable.
`env` - (optional) is enum which can be `dev` | `staging` | `prod` (`staging` is used by default).

```ts
const options = {
  issuerUrl: 'https://affinity-issuer.staging.affinity-project.org'
}

const affinityWallet = new AffinityWallet(password, encryptedSeed, options)
```

`options` - (optional) if not defined, values posted above will be used.

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

```ts
const credentials = await affinityWallet.getCredentials(shareRequestToken)
```

`shareRequestToken` - optional parameter (if passed - returns VC,
which match the request, if not - then returns all VCs).

### Get credential issued during signup process

Behaves the same as the wallet-core-sdk `confirmSignIn` method, but with the added option to issue a VC to the user's vault automatically upon signup with a verified email or phone number.

#### Confirm sign in (if using confirmSignIn for both sign up and login scenarios)

```ts
const issueSignupCredential = true
const { isNew, commonNetworkMember: affinityWallet } = await AffinityWallet.confirmSignIn(token, confirmationCode, options, issueSignupCredential)
```

`token` - AWS Cognito Access Token

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

`options` - (optional) if not defined defaults will be used.

`issueVC` - (optional) if not defined, set to false

Returns `isNew` flag, identifying whether new account was created, and
initialized instance of SDK - `affinityWallet`.

#### Confirm sign up

```ts
const issueSignupCredential = true
const affinityWallet = await AffinityWallet.confirmSignUp(token, confirmationCode, options, issueSignupCredential)
```

`token` - AWS Cognito Access Token

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

`options` - (optional) used to specify environment stack (dev | staging | prod).

`issueVC` - (optional) if not defined, set to false

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
