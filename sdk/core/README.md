# Affinity Core SDK - Affinity network DID solution

## Table of contents

- [Affinity Core SDK - Affinity network DID solution](#affinidi-core-sdk---affinity-network-did-solution)

* Workflow schemas:
  - [DID anchoring](https://swimlanes.io/u/_swm_AGW2)
  - [Share VC Flow](https://swimlanes.io/u/aG_XKsvuc)
  - [Offer VC Flow](https://swimlanes.io/u/EbNYWo10I)
  - [Wallet Storage](https://swimlanes.io/u/n-wPd_s5b)
* [How to install](#how-to-install)
* [Set Up Integration Tests](#setup-Integration-Tests)
* [Initialize](#initialize)
  - [Create API-KEY](#create-api-key)
  - [Initialize from seed](#initialize-from-seed)
  - [Sign DID document](#sign-did-document)
* [Interface](#interface)
  - [Generate seed](#generate-seed)
  - [Create DID](#create-did)
  - [Intiate SDK](#intiate-sdk)
    - [Get DID](#get-did)
    - [Passwordless sign in or sign up if user does not exist + DID creation](#passwordless-sign-in-or-sign-up-if-user-does-not-exist--did-creation)
    - [Confirm sign in](#confirm-sign-in)
    - [Is user unconfirmed](#is-user-unconfirmed)
    - [Sign up](#sign-up)
    - [Get Signup VC](#get-signup-vc)
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
  - [Verifier](#verifier)
    - [Initiate credential share request](#initiate-credential-share-request)
    - [Validate Holder Response on Share Request](#validate-holder-response-on-share-request)
    - [Validate Holder Response on Did auth Request](#validate-holder-response-on-did-auth-request)
  - [Wallet](#wallet)
    - [Initialize region for storing credentials](#initialize-region-for-storing-credentials)
    - [Create Response on credential share request](#create-response-on-credential-share-request)
    - [Create Response on credential offer request](#create-response-on-credential-offer-request)
    - [Create Response on DID auth request](#create-response-on-did-auth-request)
    - [Delete All Credentials](#delete-all-credentials)

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
[staging](https://affinity-onboarding-frontend.staging.affinity-project.org/),
[production](https://apikey.affinidi.com/) or
[dev](https://affinity-onboarding-frontend.dev.affinity-project.org/),
to obtain the `apiKey` and `apiKeyHash` values, one of which should be passed
via `options` as a required parameter.

If you want to specify issuer's URL, pass it in the options.

You can also specify the stack environment to be used in `env` variable.
`env` - (optional) is enum which can be `dev` | `staging` | `prod` (`staging` is used by default).


```ts
const options = {
  issuerUrl: 'https://affinity-issuer.staging.affinity-project.org',
  apiKey: 'YOUR API KEY'
}
```

OR

```ts
const options = {
  issuerUrl: 'https://affinity-issuer.staging.affinity-project.org',
  accessApiKey: 'YOUR API KEY HASH VALUE'
}
```

```ts
const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
```

`options` - (optional) if not defined, values posted above will be used.

[Issuer / Holder / Verifier interface examples](#interface)

### Initialize from seed

```ts
const options = {
  issuerUrl: 'https://affinity-issuer.staging.affinity-project.org',
  apiKey: '....'
}

CommonNetworkMember.fromSeed(seedHex, options, password)
```

`options` - (optional) if not defined, values posted above will be used.

`password` - (optional) if not defined, it will be generated.

### Sign DID document

```ts
const signedDidDocument = await commonNetworkMember.signDidDocument(didDocument)
```

## Interface

```ts
const { CommonNetworkMember } = require('@affinidi/wallet-core-sdk')
```

### Generate seed

Generates random seed from which keys could be derived.

```ts
const seed = await CommonNetworkMember.generateSeed(didMethod)
```

`didMethod` - (optional) enum (`elem` | `jolo`), if not defined, `elem` DID method will be used.

### Create DID

```ts
const options = { issuerUrl: 'https://affinity-issuer.staging.affinity-project.org', apiKey: '....' }

const { did, encryptedSeed } = await CommonNetworkMember.register(password, options)
```

URL mentioned above will be used, if options was not provided.

Creation of DID flow is the same for each member.
E.g. creation of DID for Verifier works the same:

```ts
const { did, encryptedSeed } = await CommonNetworkMember.register(password)
```

### Intiate SDK

```ts
const options = {
  issuerUrl: 'https://affinity-issuer.staging.affinity-project.org',
}

const networkMember = new Wallet(password, encryptedSeed, options)
```

`options` - (optional) if not defined, values posted above will be used.

#### Get DID

```ts
const networkMember = new CommonNetworkMember(password, encryptedSeed, options)

const did = networkMember.did
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
const options = { env: 'staging' }

const token = await CommonNetworkMember.signIn(username, options, messageParameters)
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

`options` - (optional) used to specify environment stack `dev | staging | prod`.
`messageParameters` - (optional) used to specify message, htmlMessage, subject, see signup method.

#### Confirm sign in

```ts
const options = { env: 'staging', didMethod: 'elem' }

const { isNew, commonNetworkMember } = await CommonNetworkMember.confirmSignIn(token, confirmationCode, options)
```

`token` - from previous step.

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

`options` - (optional) used to specify:

`env` - environment stack `dev | staging | prod`,

`didMethod` - DID method `elem` | `jolo`, if not defined, `elem` DID method will be used.

Returns `isNew` flag, identifying whether new account was created, and
initialized instance of SDK - `commonNetworkMember`.

#### Is User Unconfirmed

You can check if user is did not complete registration in Affinidi
(is `UNCONFIRMED` in Cognito) with

```ts
const options = { env: 'staging' }

const isUnconfirmed = await CommonNetworkMember.isUserUnconfirmed(username, options)
```

`username` - a valid email, phone number or arbitrary username

`options` - used to specify:

`env` - environment stack `dev | staging | prod`,

Returns `true` if user is `UNCONFIRMED`, and `false` otherwise.

#### Sign up

We STRONGLY recommend using a password at least 8 characters, but it's allowed to be 6 min
(in this case - salt as username hash and special character will be added on signup, and the same rule will be applied on login cases)

```ts
const token = await CommonNetworkMember.signUp(username, password, options, messageParameters)
```

`username` - arbitrary username, email, phone number (+123456789). In case of
arbitrary username, password recovery is not possible.

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
(`passwordlessLogin` + `completeLoginChallenge`, with OTP submit).
`When username is arbitrary username, password must be provided.`

`options` - (optional) used to specify environment stack (dev | staging | prod).
By default `staging` environment is used.

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
const options = { env: 'staging', didMethod: 'elem' }

const commonNetworkMember = await CommonNetworkMember.confirmSignUp(token, confirmationCode, options)
```

`token` - token from the previous step (value returned from the `signUp`).

`confirmationCode` - OTP sent by AWS Cognito/SES. Parameter is required if
email/phoneNumber was given as a username, and is ignored in case when
username is an arbitrary username.

`options` - (optional) used to specify:

`env` - environment stack `dev | staging | prod`,

`didMethod` - DID method `elem` | `jolo`, if not defined, `elem` DID method will be used.

To re-send sign up confirmation code (in case when username is email/phoneNumber):

```ts
await CommonNetworkMember.resendSignUpConfirmationCode(username, options, messageParameters)
```

`username` - email/phoneNumber.

`options` - (optional) used to specify environment stack (dev | staging | prod).
`messageParameters` - (optional) used to specify message, htmlMessage, subject, see signup method.

##### Sign up with email/phoneNumber (example)

```ts
const username = 'great_user@email.com'
const password = 'Password123'
const options = { env: 'dev' }

const token = await CommonNetworkMember.signUp(username, password, options)

// OTP is sent out by Cognito
const confirmationCode = '123456' // OTP from email/SMS

const networkMember = await CommonNetworkMember.confirmSignUp(token, confirmationCode, options)
```

Now user can login

- [with username and pasword](#initiate-instance-of-sdk-with-login-and-pasword) or

- [make passwordless login](#passwordless-login)

##### Sign up with arbitrary username (example)

```ts
const username = 'great_user'
const password = 'Password123'
const options = { env: 'dev' }

const networkMember = await CommonNetworkMember.signUp(username, password, options)
```

Now user can login with [username and pasword](#initiate-instance-of-sdk-with-login-and-pasword)

#### Sign up to Affinity Wallet with already created DID/keys. (Create User at Affinity Wallet and store there user keys)

User already have created keys in advance, e.g.

```ts
const { did, encryptedSeed } = await CommonNetworkMember.register(password, options)
```

Sign up with already created keys:

```ts
const keyParams = { encryptedSeed, password }
const username = 'example@affinity-project.org'
const userPassword = 'Password123'
const options = { env: 'dev' }
const messageParameters = { message: 'Welcome to Affinity, here is your OTP: {{CODE}}' } //  (optional)

const token = await CommonNetworkMember.signUpWithExistsEntity(keyParams, username, userPassword, options, messageParameters)
```

If username arbitrary value (not email or phoneNumber), then `signUpWithExistsEntity` will go throw all signup flow
In case when phoneNumber or email was used, need to execute confirm signup method with recieved OTP:

```ts
const affinityWallet = await CommonNetworkMember.confirmSignUpWithExistsEntity(keyParams, token, confirmationCode, options)
```

#### Update Did Document (supported only for jolo method):

init SDK
```ts
const affinityWallet = new CommonNetworkMember(password, encryptedSeed)
// OR
const affinityWallet = await CommonNetworkMember.fromLoginAndPassword(userName, userPassword, options)
```

Then
```ts
await affinityWallet.updateDidDocument(didDocument)
```

where didDocument - its valid signed didDocument

#### Store keys on Affinity Guardian Wallet:

NOTE: `storeEncryptedSeed` is called as a part of registration flow.

```ts
await commonNetworkMember.storeEncryptedSeed(username, password, token)
```

`username` - username

`password` - password

`token` - Cognito access token, required for authorization. If not provided,
in order to get it, sign in to Cognito will be initiated.

#### Get Signup Credential

```ts
const signedCredential = await CommonNetworkMember.getSignupCredentials(accessToken, idToken, options)
```

`accessToken` - Access JWT from AWS cognito

`idToken` - ID JWT from AWS cognito

`options` - (optional) used to specify environment stack (dev | staging | prod).

Credential offer is sent from wallet backend back to client if idToken contains verified email or phone number. Client automatically accepts and requests a signed credential. Signed credential is sent back. Signed credential is saved in the user vault.

#### Initiate instance of SDK with login and pasword

To initiate instance of networkMember using just login and password (when user already signed up at Affinity,
and if stored his keys at Affinity Guardian Wallet).

```ts
const networkMember = await CommonNetworkMember.fromLoginAndPassword(username, password, options)
```

`options` - (optional) used to specify environment stack (dev | staging | prod).

#### Passwordless login

Login to the network by username, registered in AWS Cognito.

```ts
const token = await CommonNetworkMember.passwordlessLogin(username, options)
```

`username` - email or phone number, at which confirmation code will be sent.

`options` - (optional) used to specify environment stack (dev | staging | prod).

Complete login challenge and initiate instance of SDK:

```ts
await CommonNetworkMember.completeLoginChallenge(token, confirmationCode, options)
```

`token` - token from the previous step.

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

`options` - (optional) if not defined defaults will be used.

#### Password recovery

NOTE: Password recovery is not possible with arbitrary username.

```ts
await CommonNetworkMember.forgotPassword(username, options, messageParameters)
```

`username` - email or phone number, at which confirmation code will be sent.

`options` - (optional) used to specify environment stack (dev | staging | prod).
`messageParameters` - (optional) used to specify message, htmlMessage, subject, see signup method.

Complete change password challenge:

```ts
await CommonNetworkMember.forgotPasswordSubmit(username, confirmationCode, newPassword, options)
```

`username` - username in Cognito.

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

`newPassword` - new password for Cognito user.

`options` - (optional) used to specify environment stack (dev | staging | prod).

#### Change password

User have to be logged in to change password. Otherwise use [password recovery](#password-recovery).

```ts
await commonNetworkMember.changePassword(oldPassword, newPassword, options)
```

`oldPassword` - old password.
`newPassword` - new password.

`options` - (optional) used to specify environment stack (dev | staging | prod).

#### Change username

```ts
const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

await commonNetworkMember.changeUsername(newUsername)
```

`newUsername` - email or phone number that will be a new username in Cognito.

Complete change username challenge:

```ts
const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

await commonNetworkMember.confirmChangeUsername(newUsername, confirmationCode, options)
```

`newUsername` - username from the previous step.

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

#### Sign Out

Signs out current user.

```ts
await commonNetworkMember.signOut(options)
```

`options` - (optional) used to specify environment stack (dev | staging | prod).

### Issuer

#### Initiate credential offer request

```ts
const credentialOfferToken = await issuer.generateCredentialOfferRequestToken(offeredCredentials, options)

const { audienceDid, expiresAt, nonce, callbackUrl } = options
```

`audienceDid` (string) - audience of genreated token.

`expiresAt` (isoString) - expires of genreated token.

`nonce` (string) - nonce/jti of genreated token.

`callbackUrl` (string)

#### Initiate DID auth

```ts
const authDidRequestToken = await issuer.generateDidAuthRequest(options)
```

```ts
const { audienceDid, expiresAt, nonce, callbackUrl } = options
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

### Verifier

#### Initiate credential share request

```ts
const credentialShareRequestToken = await verifier.generatePresentationChallenge(
  credentialRequirements,
  issuerDid,
  jwtOptions,
)

const { audienceDid, expiresAt, nonce, callbackUrl } = jwtOptions
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

#### Validate Holder Response on Share Request

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

const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
```

#### Create Response on credential share request

```ts
const responseToken = await wallet.createPresentationFromChallenge(
  credentialShareRequestToken,
  suppliedCredentials,
  callbackURL,
)
```

`suppliedCredentials` - credentials which Holder providing for Verifier.

`callbackURL` - (optional)

#### Create Response on credential offer request

```ts
const responseToken = await wallet.createCredentialOfferResponseToken(credentialOfferRequestToken)
```

Agree to recieve proposed credentials by the Issuer.

#### Create Response on DID auth request

```ts
const authDidResponseToken = await wallet.createDidAuthResponse(authDidRequestToken)
```

#### Delete All Credentials

**Warning**: calling this endpoint will remove all credentials from the wallet

```ts
await wallet.deleteAllCredentials()
```
