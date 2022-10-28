# Affinity Core SDK - Affinity network DID solution

> WARNING **Action required from you**  
> Update your services to use Affinidi SDK v6.0.4 or above.  
> Note please pay attention to the changelog while upgrading the version of SDK as some methods may be changed or deprecated.
> If you are using Affinidi SDK below v6, your application doesn’t support Affinidi Vault and hence we cannot migrate you out of the Bloom Vault.  
> With Affinidi SDK v6.0.4 onwards, we have also introduced automatic trigger of migration to Affinidi Vault and that is why we ask you to upgrade to that version or above.  
> Otherwise your credentials will never be migrated. The migration will not anyhow impact SDK performance negatively.  
> Furthermore, if you have more than 100 credentials in Bloom Vault the performance should be increased after migration.
> Bloom Vault is no longer supported with Affinidi SDK v7.

## Table of contents

- [Affinity Core SDK - Affinity network DID solution](#affinidi-core-sdk---affinity-network-did-solution)

* Workflow schemas:
  - [DID anchoring](https://swimlanes.io/u/_swm_AGW2)
  - [Share VC Flow](https://swimlanes.io/u/aG_XKsvuc)
  - [Offer VC Flow](https://swimlanes.io/u/EbNYWo10I)
  - [Wallet Storage](https://swimlanes.io/u/n-wPd_s5b)
  - [Revocation Flow](http://plant-uml.dev.affinity-project.org/png/jLPDRzj64BtpLmpSWoL391Nd9jG1tAG1X0PjO2NjmIMGrUwGt7h5tUw7L3VeV-yiIOkaR1q2j3vHtDcPD--z6TfBhn1kor8sKiWL_FeMBEurPrxg1cQZPoMTX-lbzN8Ew-0SMd1IOCAurnRWOkrSe7TSIMmyBC29XmjWhd-H66QzvD8mEhou6x9kqEubHxY_hxqtRfNd5I5YsuphNSvwM7cfGoFQ2qpb0wQK6KbmZIwAHP-14apFCu7xh4la7rDZzH_8VQPjbTDXAZHtET1JKRHehOFavWPkWw_XvYRfkqdVqC4Ak4Nc4OGKm6A0nJy3Ef_G9OheOrVTcTSFs9pS7rrqHZVKTQpL4jUJlYKjI06gt6YgnBZLZYw-jte7laQePLM3mZqgC6YTeLRa7e47QsETKka3bDAtiGEZXzSyvRpAYDawR3EfyprFdMS-kDIgD6gQVrTXWvRQIvcgjAN87PoAt_OlcmgE8KMH9J1kajhV1gd4eF07khbfQys-nWo2OYLJQn6zbab1JWdRgCaxsRtgVy8_yp49oQqVut6TRLR9gmpMvRVsohN5b4S5Z8UNB5uK83Gw8020VyMtZ-WNG4QN_j916PGYdfL20Ub0oqkPW3MYe-HRGGxPOhBuRc1lL2ho-_PuGC1dQ-z6HCEXbhm6R3WpBYXIs3q36Z6wMWS2kKK8Zjho6dYD_65gp0uZiDAZpU1Zjid8Qd9IRiZZPDLGffZSX2qLgb7Ci-GwWmqZqz96O3i7ix4dncOWPYDQMYaJO3Iaieql9Kr0n1aHFaHubFnr1Z_yDsJthGxeEXD7WjaJ3nsrGyTCY8uwre5gQHio43uaCgAhJtV6zN89zwUr5kFzEzKPlYUaZmG06sZmqCbuOAxVKUBDl9Yka9z_-VJZ2gwkrk-lhjeR8mzyEBdSIZQDEQa-j7nK5cO2InQK9zt_Hj3bCvUHJxwyMiQ_BwIpxft37BPZve8ncfw9lPePWusZ71uR8erHqij7T9Sd-xIlVNS6vQmpuBdZ-KI3Le8eJrp9Tq-EUluDwCmsAl8LujuwJibmGhijxh2f3F0R6O8r48o8dnAbAyax3tD9Qtra_qMhGkzjHlj6nk-4852qVsWHERqxXcU_Dz0EZ9oC_bhq3etQTiFZpwzdCZMQATfRGzzBOsM4UghcWTPVEvHj9oA3pzt3UTFC3ZI1J_5n8McQbXWpFoQpw8EDIwFjaEHhlpR30g6VoNFPxizkmvTcO4DfpuCaXhhC-URTJzr_EF-pwVu5)
* [How to install](#how-to-install)
* [Set Up Integration Tests](#setup-Integration-Tests)
* [Initialize](#initialize)
  - [Create API-KEY](#create-api-key)
  - [Set up SDK options](#set-up-sdk-options)
  - [Initialize from seed](#initialize-from-seed)
  - [Sign DID document](#sign-did-document)
* [Interface](#interface)
  - [Generate seed](#generate-seed)
  - [Create DID](#create-did)
  - [Intiate SDK](#intiate-sdk)
    - [Get DID](#get-did)
    - [Passwordless sign in or sign up if user does not exist + DID creation](#passwordless-sign-in-or-sign-up-if-user-does-not-exist--did-creation)
    - [Confirm sign in](#confirm-sign-in)
    - [Sign up](#sign-up)
    - [Initiate instance of SDK with login and pasword](#initiate-instance-of-sdk-with-login-and-pasword)
    - [Passwordless login](#passwordless-login)
    - [Password recovery](#password-recovery)
    - [Change password](#change-password)
    - [Change username](#change-username)
    - [Sign Out](#sign-out)
  - [Issuer](#issuer)
    - [Initiate credential offer request](#initiate-credential-offer-request)
    - [Initiate DID auth](#initiate-did-auth)
    - [Validate Holder Response on Offer Request](#validate-holder-response-on-offer-request)
    - [Sign multiple credentials](#sign-multiple-credentials)
    - [Generate signed credential](#generate-signed-credential)
  - [Revocation](#revocation)
    - [Flow](#revocation-flow)
    - [Issuance](#issuance-of-revocable-credential)
    - [Revocation](#revocation-of-revocable-credential)
  - [Verifier](#verifier)
    - [Initiate Verifiable Presentation request (credential share request)](#initiate-verifiable-presentation-request-credential-share-request)
    - [Validate Verifiable Presentation (Holder Response on Share Request)](#validate-verifiable-presentation-holder-response-on-share-request)
    - [Validate Holder Response on Did auth Request](#validate-holder-response-on-did-auth-request)
  - [Wallet](#wallet)
    - [Initialize region for storing credentials](#initialize-region-for-storing-credentials)
    - [Create Verifiable Presentation (Response on credential share request)](#create-verifiable-presentation-response-on-credential-share-request)
    - [Create Response on credential offer request](#create-response-on-credential-offer-request)
    - [Create Response on DID auth request](#create-response-on-did-auth-request)
    - [Claim Credential from credential offer request](#claim-credential-from-credential-offer-request)
  - [Encrypted messages](#encrypted-messages)
    - [Create encrypted message](#create-encrypted-message)
    - [Read encrypted message](#read-encrypted-message)
  - [Credentials vault](#credentials-vault)
    - [Get all credentials matching the shareRequestToken](#get-all-credentials-matching-the-sharerequesttoken)
    - [Get all credentials](#get-all-credentials)
    - [Get a single credential](#get-a-single-credential)
    - [Delete credential by ID](#delete-credential-by-id)
* [Dependencies on Affinidi infra](#affinidi-infra-dependencies)

## How to install

```shell script
npm i --save @affinidi/wallet-core-sdk
```

## Setup Integration Tests

Test credentials should be added to the top level `.env` file. These contain usernames and passwords of pre-populated accounts on the staging environment. Reach out to a team member for instructions on how to set up this file, or to obtain a copy.

You can also run integration tests against `dev`:

```sh
TEST_AGAINST=dev npm run test:integration
```

## Initialize

### Create API-KEY

You should register your entity at Affinity for appropriate environment
[staging](https://affinity-onboarding-frontend.stg.affinidi.com/),
[production](https://apikey.affinidi.com/) or
[dev](https://affinity-onboarding-frontend.dev.affinidi.com/),
to obtain the `apiKey` and `apiKeyHash` values, one of which should be passed
via `options` as a required parameter.

If you want to specify issuer's URL, pass it in the options.

You can also specify the stack environment to be used in `env` variable.
`env` - (optional) is enum which can be `dev` | `staging` | `prod` (`staging` is used by default).


```ts
const options = {
  env: 'staging',
  apiKey: 'YOUR API KEY'
}
```

OR

```ts
const options = {
  env: 'staging',
  accessApiKey: 'YOUR API KEY HASH VALUE'
}
```
`encryptedSeed`- randomly auto generated by [Generate seed](#generate-seed) [more detail example](#initialize-from-seed) material that used as input for a private key generation. Generated as a part of [register](#create-did) / [signUp](#sign-up) process and stored as encrypted value in protected vault.
seed itself never exposed to the public and available in encrypted form as a property of `wallet`.

```ts
const wallet = AffinidiWallet.openWalletByEncryptedSeed(options, encryptedSeed, password)
```

[Issuer / Holder / Verifier interface examples](#interface)

### Set up SDK options

`options` is a required parameter for wallet initialization.
You can specify optional field `didMethod` and `skipAnchoringForElemMethod` in `options`

```ts
const options = {
  env: 'staging',
  apiKey: 'YOUR API KEY',
  didMethod: '...',   // 'elem' (default),  'jolo' or 'elem-anchored'
  skipAnchoringForElemMethod: true  
}
```

If `skipAnchoringForElemMethod` is set to `true` and `didMethod` is `elem`, DID anchoring will be skipped.
By default, `didMethod` is `elem` and `skipAnchoringForElemMethod` is `false`, so anchoring will not be skipped unless explicitly specified.


### Create a new wallet

'elem-anchored' did method returns did:elem, and it is anchored with [sidetree](https://identity.foundation/sidetree/spec/) in [ropsten testnet](https://ropsten.etherscan.io/)  
note: elem-anchored doesn't support external keys due to Sidetree protocol limitations

IMPORTANT NOTICE: Please be informed that this Ropsten is a Testnet and an environment deployed for testing purposes.
Please do not include sensitive or valuable information during your trials on the Testnet.
Ropsten does not guaranty the consistency, stability or uninterrupted access to the functionalities provided herein and before as well 
as during the testing activities the user is informed and understands that any information and connections introduced,
uploaded or generated during your interactions with the Testnet can and will be removed at any time at the sole criteria of Ropsten.

```ts
const options = {
  env: 'staging',
  apiKey: '....',
  didMethod: '....' // 'elem' (default),  'jolo' or 'elem-anchored'
}

const wallet = await AffinidiWallet.createWallet(options, password)
```

### Sign DID document

```ts
const signedDidDocument = await wallet.signDidDocument(didDocument)
```

## Interface

```ts
const { AffinidiWallet } = require('@affinidi/wallet-{PLATFORM}-sdk') // where platform is one of 'browser', 'expo', 'node', 'react-native'
```

### Create DID

```ts
const wallet = await AffinidiWallet.createWallet(options, password)
const { did, encryptedSeed } = wallet
```

### Intiate SDK

```ts
const wallet = AffinidiWallet.openWalletByEncryptedSeed(options, password, encryptedSeed)
```

#### Get DID

```ts
const wallet = AffinidiWallet.openWalletByEncryptedSeed(options, password, encryptedSeed)

const did = wallet.did
```

`did` - user's DID

#### Passwordless sign in or sign up if user does not exist + DID creation

```
NOTE: This passwordless method was designed for a specific usecase, and its
simple user interface achieved by making extra calls to AWS Cognito.
If this method is chosen for authentication you may see failed requests
to Cognito in the browser's console - that is expected behaviour,
exceptions are caught and handled properly.
```

```ts
const token = await AffinidiWallet.initiateSignInPasswordless(options, username, messageParameters)
```

`username` - email or phoneNumber, of existing Cognito user or if it
does not exist, a new one will be created.

```
IMPORTANT: Username is case sensitive, so 2 separate accounts will be created
on sign up for `Test@gmail.com` and `test@gmail.com`.

In case you want to have a case-agnostic behaviour, please resolve this
on the application layer by normalizing the input before passing it to the SDK
(e.g. email.toLowerCase()).
```

`messageParameters` - (optional) used to specify message, htmlMessage, subject, see signup method.

#### Confirm sign in

```ts
const { isNew, wallet } = await AffinidiWallet.completeSignInPasswordless(token, confirmationCode, options)
```

`token` - from previous step.

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

Returns `isNew` flag, identifying whether new account was created, and
initialized instance of SDK - `wallet`.

#### Sign up

We STRONGLY recommend using a password at least 8 characters, but it's allowed to be 6 min
(in this case - salt as username hash and special character will be added on signup, and the same rule will be applied on login cases)

```ts
const wallet = await AffinidiWallet.signUpWithUsername(options, username, password, messageParameters)
```
or
```ts
const token = await AffinidiWallet.initiateSignUpByEmail(options, email, password, messageParameters)
```
or
```ts
const token = await AffinidiWallet.initiateSignUpByPhone(options, phone, password, messageParameters)
```

Password recovery is not possible unless user have registered with email or phone number or have added email or phone number later.

```
IMPORTANT: Username is case sensitive, so 2 separate accounts will be created
on sign up for `Test@gmail.com` and `test@gmail.com`.

In case you want to have a case-agnostic behaviour, please resolve this
on the application layer by normalizing the input before passing it to the SDK
(e.g. email.toLowerCase()).
```

`password` - optional.
Requirements: min length 8, require number, upper and lowercase letter.

NOTE: password is optional if username is email or phone number only.
If not provided, user will be able to login with passwordless flow only
(`initiateLogInPasswordless` + `completeLogInPasswordless`, with OTP submit).
`When username is arbitrary username, password must be provided.`

`messageParameters` - optional
```ts

const htmlMessage = `
  <table align="center" border="1" cellpadding="0" cellspacing="0" width="600">
    <tr>
     <td bgcolor="#70bbd9">
       here is your {{CODE}}.
     </td>
    </tr>
  </table>
`
const messageParameters = {
  message: 'Welcome to Affinity, your OTP: {{CODE}}'
  subject?: 'Your verification Code'
  htmlMessage?
}

{{CODE}} - will be replaced at the message by OTP
```

If htmlMessage not provided, meesage parameter will be used

`To finish registration:`

NOTE: email/SMS with verification code (OTP) will be sent to the provided
email/phoneNumber, unless username is an arbitrary username.

```ts
const wallet = await AffinidiWallet.completeSignUp(options, token, confirmationCode)
```

`token` - token from the previous step (value returned from the `initiateSignUp`).

`confirmationCode` - OTP sent by AWS Cognito/SES. Parameter is required if
email/phoneNumber was given as a username, and is ignored in case when
username is an arbitrary username.

To re-send sign up confirmation code (in case when username is email/phoneNumber):

```ts
await AffinidiWallet.resendSignUpConfirmationCode(options, token, messageParameters)
```

`token` - token returned by `initiateSignUp`.

`messageParameters` - (optional) used to specify message, htmlMessage, subject, see signup method.

##### Sign up with email/phoneNumber (example)

```ts
const email = 'great_user@email.com'
const password = 'Password123'
const options = { env: 'dev' }

const token = await AffinidiWallet.initiateSignUpByEmail(options, email, password)

// OTP is sent out by Cognito
const confirmationCode = '123456' // OTP from email/SMS

const wallet = await AffinidiWallet.completeSignUp(options, token, confirmationCode)
```

Now user can login

- [with username and pasword](#initiate-instance-of-sdk-with-login-and-pasword) or

- [make passwordless login](#passwordless-login)

##### Sign up with arbitrary username (example)

```ts
const username = 'great_user'
const password = 'Password123'
const options = { env: 'dev' }

const wallet = await AffinidiWallet.signUpWithUsername(options, username, password)
```

Now user can login with [username and pasword](#initiate-instance-of-sdk-with-login-and-pasword)

#### Sign up to Affinity Wallet with already created DID/keys. (Create User at Affinity Wallet and store there user keys)

User already have created keys in advance, e.g.

```ts
const { did, encryptedSeed } = await AffinidiWallet.createWallet(options, password)
```

Sign up with already created keys:

```ts
const keyParams = { encryptedSeed, password }
const email = 'example@affinity-project.org'
const userPassword = 'Password123'
const options = { env: 'dev' }
const messageParameters = { message: 'Welcome to Affinity, here is your OTP: {{CODE}}' } //  (optional)

const token = await AffinidiWallet.initiateSignUpByEmail(options, email, userPassword, messageParameters)
const confirmationCode = '123456'
const wallet = await AffinidiWallet.completeSignUp(options, token, confirmationCode, keyParams)
```

Or, alternatively, if an arbitrary username is used

```ts
const wallet = await AffinidiWallet.signUpWithUsername(options, username, password, keyParams)
```

#### Update Did Document (supported only for jolo method):

init SDK
```ts
const wallet = await AffinidiWallet.openWalletByEncryptedSeed(options, encryptedSeed, password)
// OR
const wallet = await AffinidiWallet.logInWithPassword(options, userName, userPassword)
```

Then
```ts
await wallet.updateDidDocument(didDocument)
```

where didDocument - its valid signed didDocument

#### Initiate instance of SDK with login and pasword

To initiate instance of wallet using just login and password (when user already signed up at Affinity,
and if stored his keys at Affinity Guardian Wallet).

```ts
const wallet = await AffinidiWallet.logInWithPassword(options, username, password)
```

`options` - (optional) used to specify environment stack (dev | staging | prod).

#### Initiate instance of SDK with refreshToken

To initiate instance of wallet using refreshToken.  
To get refreshToken use wallet.serializeSession() (for wallets with cognito, when logged in)

> Take care about refresh token to save it in right place, its lifetime is 30 days. 
> To invalidate tokens please use wallet.logOut() method. 
> The best way to use only access token and re-login user each hour (lifetime of accessToken)

```ts
const wallet = await AffinidiWallet.logInWithRefreshToken(options, refreshToken)
```

`options` - (optional) used to specify environment stack (dev | staging | prod).

#### Passwordless login

Login to the network by username, registered in AWS Cognito.

```ts
const token = await AffinidiWallet.initiateLogInPasswordless(options, login, messageParameters: MessageParameters )
```

`login` - email or phone number, at which confirmation code will be sent.

`messageParameters` -  (optional) used to specify message, htmlMessage, subject, see signup method.

Complete login challenge and initiate instance of SDK:

```ts
const wallet = await AffinidiWallet.completeLoginPasswordless(options, token, confirmationCode)
```

`token` - token from the previous step.

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

`completeLoginPasswordless` could return next errors: 

- `COR-5` Invalid confirmation OTP code  was uses.
As part of error payload new session token is passed that should be used for continuation of completing a session with old OTP

```ts
import retry from "async-retry";

let newToken;
try {
  const wallet = await AffinidiWallet.completeLoginPasswordless(options, token, invalidConfirmationCode)
} catch (sdkError) {
  if (sdkError.code === 'COR-5') {
    newToken = sdkError.context.newToken
  }
}
const wallet = await AffinidiWallet.completeLoginPasswordless(options, newToken, confirmationCode)

```
**CAUTION** for serverside SDK usage you should always use a token returned with error to continue process

Up to 3 retries are possible. After 3 times new session should be used

- `COR-13` Invalid confirmation OTP code was used 3 times or more. Use a `initiateLogInPasswordless` call to initiate a new session.
- `COR-17` Confirmation code is expired. Lifetime of confirmation code is around 3 minutes. Use a `initiateLogInPasswordless` call to initiate a new session

#### Password recovery

NOTE: Password recovery is not possible with arbitrary username.

```ts
const token = await AffinidiWallet.initiateForgotPassword(options, login, messageParameters)
```

`username` - email or phone number, at which confirmation code will be sent.

`messageParameters` - (optional) used to specify message, htmlMessage, subject, see signup method.

Complete change password challenge:

```ts
const wallet = await AffinidiWallet.completeForgotPassword(options, token, confirmationCode)
```

`token` - token returned by `initiatePassword`

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

`newPassword` - new password for Cognito user.

#### Change password

User have to be logged in to change password. Otherwise use [password recovery](#password-recovery).

```ts
await wallet.changePassword(oldPassword, newPassword)
```

`oldPassword` - old password.

`newPassword` - new password.

#### Change username

```ts
const token = await wallet.initiateChangeEmail(newEmail)
```
or
```ts
const token = await wallet.initiateChangePhone(newPhone)
```

`newEmail` or `newPhone` - email address or phone number to be later used to log into cognito

Complete change username challenge:

```ts
await wallet.completeChangeEmailOrPhone(options, token, confirmationCode)
```

`token` - token returned on the previous step.

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

#### Sign Out

Signs out current user from all devices.  
It also invalidates all refresh tokens issued to a user.  
The user's current access and Id tokens remain valid until their expiry.  
Access and Id tokens expire one hour after they are issued.

```ts
await wallet.logOut()
```

#### Serialize session

Returns all active cognito tokens as json string  
{ "accessToken": "eyJraWQiOiJHiLCJlxKU...", "idToken": 'eyJraWQiOiJQYTVjZFwvKzVyb...", "refreshToken": 'eyJjdHkiOiJKV1QiLCJ...", "expiresIn": 1655544042964 }

```ts
await wallet.serializeSession()
```

### Issuer

#### Initiate credential offer request

```ts
const jwtOptions = { audienceDid, expiresAt, nonce, callbackUrl }

const credentialOfferToken = await issuerWallet.generateCredentialOfferRequestToken(offeredCredentials, jwtOptions)
```

`audienceDid` (string) - audience of genreated token.

`expiresAt` (isoString) - expires of genreated token.

`nonce` (string) - nonce/jti of genreated token.

`callbackUrl` (string)

#### Initiate DID auth

```ts
const jwtOptions = { audienceDid, expiresAt, nonce, callbackUrl }

const authDidRequestToken = await issuerWallet.generateDidAuthRequest(jwtOptions)
```

`audienceDid` (string) - audience of genreated token.

`expiresAt` (isoString) - expires of genreated token.

`nonce` (string) - nonce/jti of genreated token.

`callbackUrl` (string)

```ts
const offeredCredentials = [
  {
    type: 'IssuerCustomCredential',
    renderInfo,
  },
]
```

`renderInfo` (optional) where issuer can define how that VC can be represented/shown.

Example:

```ts
const renderInfo = {
  logo: {
    url: 'https://miro.medium.com/fit/c/240/240/1*jbb5WdcAvaY1uVdCjX1XVg.png',
  },
  background: {
    url: 'https://i.imgur.com/0Mrldei.png',
  },
  text: {
    color: '#05050d',
  },
}
```

`credentialOfferToken` can be passed to the wallet side, and let Wallet/Holder option to response
to this offer if usser want take offered credentials.

#### Validate Holder Response on Offer Request

```ts
const { isValid, did, nonce, selectedCredentials } = await issuer.verifyCredentialOfferResponseToken(
  credentialOfferResponseToken,
  credentialOfferRequestToken,
)
```

`credentialOfferRequestToken` (optional) - using when need check response against request (nonce, audience).

Validates response token and verify signature, if verification not passed response `{ isValid: false }`
if response is valid returns also `{ issuer, nonce, selectedCredentials }`.

`did` - it's DID which signed that response.

#### Sign multiple credentials

```ts
import { VCV1Unsigned } from '@affinidi/vc-common'
import { VCSPhonePersonV1, getVCPhonePersonV1Context } from '@affinidi/vc-data'
import { buildVCV1Unsigned, buildVCV1Skeleton } from '@affinidi/vc-common'

const unsignedCredentials: VCV1Unsigned[] = [
  buildVCV1Unsigned({
    skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
      id: 'urn:urn-5:...',
      credentialSubject: {
        data: {
          '@type': ['Person', 'PersonE', 'PhonePerson'],
          telephone: '+1 555 555 5555',
        },
      },
      holder: { id: 'did:...:...' },
      type: 'PhoneCredentialPersonV1',
      context: getVCPhonePersonV1Context(),
    }),
    issuanceDate: new Date().toISOString(),
    expirationDate: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
  }),
]

const credentials = await signCredentials(credentialOfferResponseToken, unsignedCredentials)
```

`credentialOfferResponseToken` - credential offer response JWT.

`credentialParams` - array of params for credentials, where `expiresAt` is optional.

#### Generate signed credential

```ts
import { VCSPhonePersonV1, getVCPhonePersonV1Context } from '@affinidi/vc-data'

const credentialSubject: VCSPhonePersonV1 = {
  data: {
    '@type': ['Person', 'PersonE', 'PhonePerson'],
    telephone: '+1 555 555 5555',
  },
}

const credentialMetadata = {
  context: [getVCPhonePersonV1Context()],
  name: 'Phone Number',
  type: ['PhoneCredentialPersonV1'],
}

const credential = await issuer.signCredential(
  credentialSubject,
  credentialMetadata,
  { credentialOfferResponseToken, requesterDid },
  expiresAt,
)
```

`credentialSubject` - data which should be present in VC according to VC schema, must be a valid `VCV1Subject`.

`credentialMetadata` - schema of credential (should be defined and Issuer and Verifier use the same,
so verifier will be able to understand what kind of credential was created by Issuer).

### Revocation
SDK Support Issuing Revocable Credential based on [Revocation List 2020 W3C standard](https://w3c-ccg.github.io/vc-status-rl-2020)
- [Concepts](https://w3c-ccg.github.io/vc-status-rl-2020/#core-concept)
- [revocationlist2020credential](https://w3c-ccg.github.io/vc-status-rl-2020/#revocationlist2020credential)
- [revocationlist2020status](https://w3c-ccg.github.io/vc-status-rl-2020/#revocationlist2020status)

#### Revocation Flow

[Revocation Flow](http://plant-uml.dev.affinity-project.org/png/jLPDRzj64BtpLmpSWoL391Nd9jG1tAG1X0PjO2NjmIMGrUwGt7h5tUw7L3VeV-yiIOkaR1q2j3vHtDcPD--z6TfBhn1kor8sKiWL_FeMBEurPrxg1cQZPoMTX-lbzN8Ew-0SMd1IOCAurnRWOkrSe7TSIMmyBC29XmjWhd-H66QzvD8mEhou6x9kqEubHxY_hxqtRfNd5I5YsuphNSvwM7cfGoFQ2qpb0wQK6KbmZIwAHP-14apFCu7xh4la7rDZzH_8VQPjbTDXAZHtET1JKRHehOFavWPkWw_XvYRfkqdVqC4Ak4Nc4OGKm6A0nJy3Ef_G9OheOrVTcTSFs9pS7rrqHZVKTQpL4jUJlYKjI06gt6YgnBZLZYw-jte7laQePLM3mZqgC6YTeLRa7e47QsETKka3bDAtiGEZXzSyvRpAYDawR3EfyprFdMS-kDIgD6gQVrTXWvRQIvcgjAN87PoAt_OlcmgE8KMH9J1kajhV1gd4eF07khbfQys-nWo2OYLJQn6zbab1JWdRgCaxsRtgVy8_yp49oQqVut6TRLR9gmpMvRVsohN5b4S5Z8UNB5uK83Gw8020VyMtZ-WNG4QN_j916PGYdfL20Ub0oqkPW3MYe-HRGGxPOhBuRc1lL2ho-_PuGC1dQ-z6HCEXbhm6R3WpBYXIs3q36Z6wMWS2kKK8Zjho6dYD_65gp0uZiDAZpU1Zjid8Qd9IRiZZPDLGffZSX2qLgb7Ci-GwWmqZqz96O3i7ix4dncOWPYDQMYaJO3Iaieql9Kr0n1aHFaHubFnr1Z_yDsJthGxeEXD7WjaJ3nsrGyTCY8uwre5gQHio43uaCgAhJtV6zN89zwUr5kFzEzKPlYUaZmG06sZmqCbuOAxVKUBDl9Yka9z_-VJZ2gwkrk-lhjeR8mzyEBdSIZQDEQa-j7nK5cO2InQK9zt_Hj3bCvUHJxwyMiQ_BwIpxft37BPZve8ncfw9lPePWusZ71uR8erHqij7T9Sd-xIlVNS6vQmpuBdZ-KI3Le8eJrp9Tq-EUluDwCmsAl8LujuwJibmGhijxh2f3F0R6O8r48o8dnAbAyax3tD9Qtra_qMhGkzjHlj6nk-4852qVsWHERqxXcU_Dz0EZ9oC_bhq3etQTiFZpwzdCZMQATfRGzzBOsM4UghcWTPVEvHj9oA3pzt3UTFC3ZI1J_5n8McQbXWpFoQpw8EDIwFjaEHhlpR30g6VoNFPxizkmvTcO4DfpuCaXhhC-URTJzr_EF-pwVu5)

#### issuance of Revocable credential 

```ts
   const unsignedCredential = buildVCV1Unsigned({
      skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
        id: `credId:${credId}`,
        credentialSubject: {
          data: {
            '@type': ['Person', 'PersonE', 'PhonePerson'],
            telephone: '+1 555 555 5555',
          },
        },
        holder: { id: holderDid },
        type: 'PhoneCredentialPersonV1',
        context: getVCPhonePersonV1Context(),
      }),
      issuanceDate: new Date().toISOString(),
      expirationDate: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
    })

    const revokableUnsignedCredential = await wallet.buildRevocationListStatus(
      unsignedCredential,
      accessToken,
    )

```
`buildRevocationListStatus` will add to **unsigned credential** special `credentialStatus` field with [revocationlist2020status](https://w3c-ccg.github.io/vc-status-rl-2020/#revocationlist2020status) data.

#### Revocation of Revocable credential

```
 await wallet.revokeCredential(credentialId, 'Status changed', accessToken)
```

`credentialId` - id of credential for revoke 

`revocation reason` - free text reason of revocation

`accessToken`

### Verifier

#### Initiate Verifiable Presentation request (credential share request)

##### Verifiable Presentation according to w3c spec structure flow:
```ts
const jwtOptions = { audienceDid, expiresAt, nonce, callbackUrl }

const presentationChallenge = await verifier.generatePresentationChallenge(
  credentialRequirements,
  issuerDid,
  jwtOptions,
)
```

`audienceDid` (string) - audience of genreated token.

`expiresAt` (isoString) - expires of genreated token.

`nonce` (number) - nonce/jti of genreated token.

`callbackUrl` (string)

Generates JWT with info of which VC `credentialRequirements` to be provided from Wallet/Holder.

```ts
const credentialRequirements = [{ type: ['Credential', 'ProofOfNameCredential'] }]
```

`callbackUrl` - (optional) Holder/Wallet will be able send response on this request to this URL.

`issuerDid` - (optional) its contrain, that define required isser of VC.

`credentialShareRequestToken` can be send to Wallet/Holder to anwser on this with response with requested VC inside.

##### Verifiable Presentation as JWT method:

```ts
const credentialShareRequestToken = await verifier.generateCredentialShareRequestToken(
  credentialRequirements,
  issuerDid,
  options,
)
```

see parameters description at `Verifiable Presentation according to w3c spec` section

#### Validate Verifiable Presentation (Holder Response on Share Request)

##### Verifiable Presentation according to w3c spec structure flow:
```ts
const { isValid, did, challenge, suppliedPresentation } = await verifier.verifyPresentation(vp)
```

##### Verifiable Presentation as JWT method:
```ts
const { isValid, did, nonce, suppliedCredentials } = await verifier.verifyCredentialShareResponseToken(
  credentialShareResponseToken,
  credentialShareRequestToken,
  shouldOwn,
)
```

`credentialShareResponseToken` - (optional) using when need check response against request (when request have constrains).

`shouldOwn` - (optional) Verify that subject is holder of VC.  Default true as per W3C spec.

Its validate response token and verify signature on provided VC inside, if verification not passed response `{ isValid: false }`.
If response is valid it returns also `{ did, nonce, suppliedCredentials }`.

#### Validate Holder Response on Did auth Request

```ts
const { isValid, did, nonce } = await verifier.verifyDidAuthResponse(authDidResponseToken, authDidRequestToken)
```

Its validate response token, if verification not passed response `{ isValid: false }`
if response is valid returns also `{ did, nonce }`

### Wallet

#### Initialize region for storing credentials

You can specify AWS region where user credentials will be stored using optional
`storageRegion` parameter (region should be a 3 character string correlating to
an Alpha-3 country code).

```ts
const options = {
  storageRegion: 'SGP'
}
```

#### Create Verifiable Presentation (Response on credential share request)

##### Verifiable Presentation according to w3c spec structure flow:

```ts
const vp = await wallet.createPresentationFromChallenge(
  presentationChallenge,
  credentials,
  domain,
)
```

`credentials` - credentials which Holder providing for Verifier.

`callbackURL` - (optional)

`domain` - (could be empty string)

##### Verifiable Presentation as JWT method:
```ts
const responseToken = await wallet.createCredentialShareResponseToken(
  credentialShareRequestToken,
  suppliedCredentials,
  expiresAt,
)
```

`credentialShareRequestToken` (jwt) - previously generated request token.

`suppliedCredentials` - credentials which Holder providing for Verifier.

`expiresAt` (isoString) - (optional) expires of created token.


#### Create Response on credential offer request

```ts
const responseToken = await wallet.createCredentialOfferResponseToken(credentialOfferRequestToken)
```

Agree to recieve proposed credentials by the Issuer.

#### Create Response on DID auth request

```ts
const authDidResponseToken = await wallet.createDidAuthResponse(authDidRequestToken)
```

#### Claim Credential from credential offer request
Exchange `credentialOfferResponseToken` to a credentials from a callback url specified in request for offer.
```ts
const credentials = await wallet.claimCredentials(credentialOfferRequestToken)
```

Requirements to a callback endpoint 
- accept `credentialOfferResponseToken` in a post body
```json
{
  "credentialOfferResponseToken": "xxxxx.xxxxx.xxx"
}
```
- return an array of credentials in a payload

```json
{
  "vcs": []
}
```

Expected errors 
- `COR-26` & `COR-19` - `credentialOfferRequestToken` validation errors 
- `COR-27` - failed to invoke callback url 
- `COR-28` - unsuccessful callback invocation. 
- `COR-29` - invalid response format. No credentials  

### Encrypted messages

#### Create encrypted message

```ts
const encryptedMessage = await wallet.createEncryptedMessage(toDid, object)
```

`toDid` - DID, string value of document to be resolved.

`object` - value to be encrypted by public key.

#### Read encrypted message

```ts
const message = await wallet.readEncryptedMessage(encryptedMessage)
```

`encryptedMessage` - message to be decrypted.

### Credentials vault

```ts
const credentials = [ signedCredential ]
const storageRegion = 'SGP'

await wallet.saveCredentials(credentials, storageRegion)
```

`credentials` - array of credentials to store in the vault.

`storageRegion` - (optional) AWS region where user's credentials will be stored.
Region should be a 3 character string correlating to an Alpha-3 country code.

#### Get all credentials matching the shareRequestToken
```ts
const credentials = await wallet.getCredentials(shareRequestToken)
```

`shareRequestToken` - optional parameter (if passed - returns VC,
which match the request, if not - then returns all VCs).

#### Get all credentials
```ts
const credentials = await wallet.getCredentials(null)
```

#### Get a single credential
```ts
const credential = await wallet.getCredentialById(credentialId)
```

#### Delete credential by ID

```ts
await wallet.deleteCredential(credentialId)
```

## Affinidi Infra dependencies
This SDK using next Affinidi services:
- affinidi registry (to anchor when applicable, resolve and update did/didDocument)
- affinidi verifier (to build credential request)
- affinidi issuer (to build credential offer and verify credential offer response)
- affinidi wallet backend (to store endrypted seed and encrypted VC optioanlly as backup)
- affinidi user management (using only when backup option for encrypted seed used)
