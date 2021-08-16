# release 6.0.0-beta.6 (2021-08-13)
* Simplified npm dependencies; it is enough to only install `@affinidi/wallet-{PLATFORM}-sdk` now (without other `@affinidi` packages);
  all the relevant types and methods are now exported from `@affinidi/wallet-{PLATFORM}-sdk`.
* Introduced new streamlined set of factories and methods for user management, with clearer return values.
  - Note that instances returned by non-legacy factories do not have legacy methods, and vice versa.
  - Note that in new methods, every method accepting confirmation code now also requires to be passed a token,
    which is the string value returned by a method that sent a confirmation code.
  - Note that new instance (non-static) methods no longer accept an options object.
  - Note that signup methods that return "either `string` or `AffinidiWallet`" are deprecated,
    instead you should either let user to explicitly choose between using an username, email address or phone number,
    or detect the type of login by invoking `Util.getLoginType`,
    and then invoke the relevant signup method (`signUpWithUsername` or `initiateSignUpByEmail` or `initiateSignUpByPhone`).
* Implemented new methods:
  - In wallet instances:
    ```
    signJwt
    signUnsignedCredential
    signUnsignedPresentation
    ```
  - In new `Util` object:
    ```
    generateSeed
    getDidFromToken
    getLoginType
    getPublicKeyHexFromDidDocument
    fromJWT
    ```
* Full list of deprecated methods:
  - ```
    new AffinidiWallet()
    anchorDid
    changePassword
    changeUsername
    completeLoginChallenge
    confirmChangeUsername
    confirmSignIn
    confirmSignUp
    confirmSignUpWithExistsEntity
    forgotPassword
    forgotPasswordSubmit
    fromAccessToken
    fromJWT
    fromLoginAndPassword
    fromSeed
    generateSeed
    getDidFromToken
    init
    initiateEmailCredential
    initiatePhoneCredential
    isUserUnconfirmed
    passwordlessLogin
    pullEncryptedSeed
    register
    resendSignUpConfirmationCode
    signIn
    signOut
    signUp
    signUpWithExistsEntity
    storeEncryptedSeed
    verifyEmailCredential
    verifyPhoneCredential
    get accessToken
    ```
  - Note that these methods will be removed in v7.
  - If you don't want deprecated methods to pollute your IDE auto-complete suggestions, use `AffinidiWalletV6` instead of `AffinidiWallet`;
    the only difference between the two is that the former does not contain deprecated methods.
* Breaking changes
  - `AffinidiWallet`, `AffinityWallet`, `CommonNetworkMember` are no longer classes;
    `AffinidiWallet` and `AffinityWallet` are now collections of static methods
    (although they support being called as `new AffinidiWallet()` for backwards compatibility),
    and you can no longer extend them or rely on their return value being an instance of `AffinidiWallet`;
    `CommonNetworkMember` is now only a type.
  - Nothing `dangerous` is exported now.
  - `FreeFormObject` is removed.
# release 6.0.0-beta.5 (2021-07-26)
  * passing `sdkVersion` to all api services
# release 6.0.0-beta.4 (2021-07-23)
* Created `AffinidiVaultStorageService` for managing credentials at Affinidi vault:
  - saveCredentials - stores VC in Affinidi vault
  - searchCredentials - lookups VCs in Affinidi vault
  - getCredentialById - gets VC by credential id
  - deleteCredentialById - deletes VC by credential id
  - deleteAllCredentials - deletes all VCs
* Created `BloomVaultStorageService` and moved all related code to Bloom vault out of `WalletStorageService`
* Updated `WalletStorageService` to be as an adapter to combine `AffinidiVaultStorageService` and `BloomVaultStorageService`:
  - saveCredentials - stores VC in Affinidi vault only using `AffinidiVaultStorageService`
  - searchCredentials - lookups unique VCs in Affinidi (using `AffinidiVaultStorageService`) and Bloom (using `BloomVaultStorageService`) vaults
  - getCredentialById - gets VC by credential id from Affinidi vault (using `AffinidiVaultStorageService`), in case not found from Bloom vault (using `BloomVaultStorageService`)
  - deleteCredentialById - deletes VC by credential id from `AffinidiVaultStorageService`, in case not found from `BloomVaultStorageService`
  - deleteAllCredentials - deletes all VCs from Affinidi (using `BloomVaultStorageService`) and Bloom (using `AffinidiVaultStorageService`) vaults
* Updated `CommonNetworkMember`:
  - added `getCredentialById` - gets VC by credential id
  - added `getAllCredentials` - gets all VCs
  - added `getCredentialsByShareToken` - gets VCs by credential share request token
  - added `deleteCredentialById` - deletes by id
* Breaking changes:
  - method `WalletStorageService.filterCredentials` removed, use `getCredentialsByShareToken` instead
  - method `WalletStorageService.saveCredentials` do not saving VC to Bloom vault anymore, only to Affinidi vault
  - method `WalletStorageService.deleteCredentialByIndex` removed, use `deleteCredentialById` instead
  - method `WalletStorageService.fetchAllBlobs` removed, use `getAllCredentials` instead
  - method `WalletStorageService.fetchAllDecryptedCredentials` removed, use `getAllCredentials` instead
  - method `WalletStorageService.encryptAndSaveCredentials` removed, use `saveCredentials` instead
  - method `WalletStorageService.getCredentialByIndex` removed, use `getCredentialById` instead
  - method `WalletStorageService.deleteCredential` removed, use `deleteCredentialById` instead
  - method `WalletStorageService.signByVaultKeys` now private and moved to `BloomVaultStorageService._signByVaultKeys`
  - method `WalletStorageService.authorizeVcVault` now private and moved to `BloomVaultStorageService._authorizeVcVault`
  - method `WalletStorageService.fetchEncryptedCredentials` removed
  - method `CommonNetworkMember.deleteCredentialByIndex` removed, use `deleteCredentialById` instead
  - method `CommonNetworkMember.deleteCredential` removed, use `deleteCredentialById` instead
  - method `CommonNetworkMember.getCredentialByIndex` removed, use `getCredentialById` instead
# release 6.0.0-beta.3 (2021-07-19)
  * API client services moved out to `@affinidi/internal-api-clients`
  * `SdkError` is now exported by `@affinidi/common`
# release 6.0.0-beta.1 (2021-06-29)
  * Improved type inference.
  * `CommonNetworkMember._affinity` made protected.
  * Breaking changes:
    * Code targets ES2019 now.
    * More specific type declarations.
    * `SdkOptions` parameters are now non-optional.
    * `SdkOptions.env` field is now required.
    * `CommonNetworkMember.confirmSignUp` and `confirmSignUpWithExistsEntity` now throws an error when called for a username
      (as opposed to email address or a phone number).
      Signups with plain usernames never required any confirmation.
  * Additional breaking changes:
    * `SdkOptions` parameters are no longer modified.
    * Removed internal `CognitoService`, use `CommonNetworkMember` instead, or `UserManagementService` or `CognitoIdentityService` in case of need.
    * Some internal methods moved out from internal `WalletStorageService` to `KeyStorageApiService` or `KeyManagementService`.
    * These changes do not affect projects that did not directly use internal `CognitoService` or `WalletStorageService` classes,
      and that did not rely on `CommonNetworkMember` methods having an undocumented side effect of modifying the options parameter.
# release 5.0.1 (2021-06-21)
  * Removed TestmailInbox from `__dangerous` to fix unnecessary `crypto-random-string` import
# release 5.0.0 (2021-06-16)
  * Implemented `WalletStorageService.fetchAllBlobs`.
  * Fixed `WalletStorageServices.fetchAllEncryptedCredentialsInBatches` stopping on batches with deleted entries.
  * Optimized `WalletStorageService.fetchAllEncryptedCredentialsInBatches` to only call `authorizeVcVault` once instead of once per batch.
  * Deprecation candidates from v4.2.1 marked as deprecated.
  * Also refer to the changelog for `common` v1.9.0.
  * Breaking changes:
    * `WalletStorageService.fetchAllEncryptedCredentialsInBatches` is now private, use `fetchAllBlobs` instead.
    * More specific type declarations.
    * `CommonNetworkMember` made abstract.
      Use `AffinityWallet` from `wallet-browser-sdk`, `wallet-expo-sdk` or `wallet-react-native-sdk` instead,
      or implement your own derived class using these as a reference.
      See JSDoc comment for `CommonNetworkMember` for more information on this change.
      This change does not affect projects that do not use `CommonNetworkMember` directly.
# release 4.3.1 (2021-06-07)
  * Fixed DID validation
# release 4.3.0 (2021-06-04)
  * Reorganized dependencies
# release 4.2.6 (2021-05-31)
* custom messages support for all methods
* updated OTP tests
# release 4.2.5 (2021-05-27)
  * optional DTO fields are marked as TypeScript optional fields
# release 4.2.4 (2021-05-04)
  * custom messages support for passwordless login 
  * vc-data winner schema 
# release 4.2.3 (2020-04-01)
 * add optional pagination to `WalletStorageService.fetchEncryptedCredentials` (backward compatible)
 * add new `WalletStorageService.fetchAllEncryptedCredentialsInBatches` method for retrieving all credentials page by page using async generators
 * fix elem did anchor metrics blocks flow in case of failure
# release 4.2.2 
 * use new `vc-data` 
# release 4.2.1 (2020-02-22)
 * axios version update 
### Deprecation candidates 
CommonNetworkMember 
  - initiateEmailCredential
  - verifyEmailCredential
  - initiatePhoneCredential
  - verifyPhoneCredential

 
# release 4.2.0 (2020-02-16)
 * axios version update 
 * `CommonNetworkMember.setEnvironmentVarialbles` return `env` as part of result options. 
# release 3.4.0 (2020-12-01)

## New interface

Add `isUserUnconfirmed` to check if user completed registration in Affinidi.

# release 3.0.0 (2020-11-03)

Drop the support of the test Api Key, thus it is crucial to make the update due to all earlier versions would be affected by that change.

# release 1.3.5 (2020-10-16)

# Improvements

- Bump to latest VC Common that includes protection against malleable VCs and VPs, see [here](https://github.com/affinityproject/affinidi-core-sdk/blob/master/common-libs/vc-common/CHANGELOG.md#111) for more details.

# release 0.13.0 (2020-09-08)

## Update behavior

- signing and verifying credentials/presentations now requires full context. This ensures that the data within a VC/VP cannot be manipulated. This behavior was changed at the lower level libs issuer-util and verifier-util.

# release 0.12.0 (2020-09-08)

## New interface:

#### Sign up to Affinity Wallet with already created DID/keys. (Create User at Affinity Wallet and store there user keys)

User already have created keys in advance, e.g.

```ts
const { did, encryptedSeed } = await CommonNetworkMember.register(password, options)
```

Sign up with already created keys:

```ts
const keyParams = { encryptedSeed, password }
const username = 'example@affinity-project.org'
const password = 'Password123'
const options = { env: 'dev' }
const messageParameters = { message: 'Welcome to Affinity, here is your OTP: {{CODE}}' }(optional)

const token = await CommonNetworkMember.signUpWithExistsEntity(
  keyParams,
  username,
  password,
  options,
  messageParameters,
)
```

If username arbitrary value (not email or phoneNumber), then `signUpWithExistsEntity` will go throw all signup flow
In case when phoneNumber or email was used, need to execute confirm signup method with recieved OTP:

```ts
const affinityWallet = await CommonNetworkMember.confirmSignUpWithExistsEntity(
  keyParams,
  token,
  confirmationCode,
  options,
)
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

# release 0.11.1 (2020-09-01)

## Update interface

```ts
const token = await CommonNetworkMember.signUp(username, password, options, messageParameters)
```

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

```ts
const token = await CommonNetworkMember.signIn(username, options, messageParameters)
```

# release 0.7.0 (2020-06-31)

## Update interface

```ts
const networkMember = await CommonNetworkMember.fromLoginAndPassword(username, password, options)

await networkMember.signOut(options)
```

`options` - (optional) used to specify environment stack (dev | staging | prod).

# release 0.6.0 (2020-07-09)

## Rename "isHolderMustBeSubject to shouldOwn in internal implementation"

Housekeeping change

## Set default shouldOwn/isHolderMustBeSubject to true instead of false (**BREAKING CHANGE**)

W3C spec mandates this requirement, may break any implementations that omit the value.

# release 0.5.0 (2020-07-09)

## Update the interface (**BREAKING CHANGE**)

The input of these methods have been changed so W3C compliant credentials can be issued.

### signCredentials

Instead of accepting an array of `CredentialParams` it accepts an array
of `VCV1Unsigned` from the `@affinidi/vc-common` library.
It now returns an array of `VCV1`.

### signCredential

Instead of accepting a `FreeFormObject` for the claim of the credential.
It now accepts `VCV1SubjectBaseMA`, which is a single item or array
of `VCV1Subject`s.
This is the type of `VCV1.credentialSubject` from `@affinidi/vc-common`.
It now returns a `VCV1`.

# release 0.4.6 (2020-06-26)

## Simplify register flow when arbitrary (ONLY) username is used

To register a new user with arbitrary username, calling `signUp` is sufficient.
No need to call `confirmSignUp` as registration is already completed.

# release 0.4.0 (2020-06-18)

## Bug fix with default environment

## Update interface

```ts
await CommonNetworkMember.signOut(options)
```

`options` - (optional) used to specify environment stack (dev | staging | prod).

# release 0.3.9 (2020-05-22)

## Bug fix for storeEncryptedSeed method

# release 0.3.8 (2020-05-21)

## Update interface

### Set stack environement on SDK init:

You can specify the stack environment to be used in the `env` variable.
`env` - (optional) is enum which can be `dev` | `staging` | `prod` (`staging` is used by default).

```ts
const options = { env: 'staging' }

new CommonNetworkMember(password, encryptedSeed, options)
```

This is related to the following methods:

```ts
affinity = await CommonNetworkMember.register(password, options)

affinity = await CommonNetworkMember.fromSeed(seedHex, options, password)

token = await CommonNetworkMember.passwordlessLogin(username, options)
affinity = await CommonNetworkMember.completeLoginChallenge(token, confirmationCode, options)

await CommonNetworkMember.forgotPassword(username, options)
await CommonNetworkMember.forgotPasswordSubmit(username, confirmationCode, newPassword, options)

affinity = await CommonNetworkMember.fromLoginAndPassword(username, password, options)

token = await CommonNetworkMember.signUp(username, password, options)
affinity = await CommonNetworkMember.confirmSignUp(token, confirmationCode, options)

await CommonNetworkMember.resendSignUpConfirmationCode(username, options)

token = await CommonNetworkMember.signIn(username, options)
affinity = await CommonNetworkMember.confirmSignIn(token, confirmationCode, options)

affinity = new CommonNetworkMember(password, encryptedSeed, options)
await affinity.changeUsername(newUsername)

affinity = new CommonNetworkMember(password, encryptedSeed, options)
await affinity.confirmChangeUsername(newUsername, confirmationCode, options)
```

# [release 1.2.5](https://github.com/affinityproject/affinity-sdk/compare/1.2.4...affinityproject:1.2.5) (2020-03-12)

## Add interface

### signCredentials

```shell
const credentialParams = {
  type:              'ProofOfAgeOverCredential',
  context:           [{ 'id': '@id', 'type': '@type', 'schema': 'http://schema.org/' }],
  credentialSubject: 'credentialSubject': { 'ageOver': 18 },
  expiresAt:         '2021-01-16T07:06:35.337Z',
}

const credentials = await signCredentials(credentialOfferResponseToken, credentialParams)
```

`credentialOfferResponseToken` - credential offer response JWT
`credentialParams` - array of params for credentials, where `expiresAt` is optional

# [release 1.2.4](https://github.com/affinityproject/affinity-sdk/compare/1.2.3...affinityproject:1.2.4) (2020-03-12)

## Add interface

### getDidFromToken

```shell
const did = CommonNetworkMember.getDidFromToken(jwt)
```

jwt - JWT

# [release 1.2.3](https://github.com/affinityproject/affinity-sdk/compare/1.2.0...affinityproject:1.2.3) (2020-03-12)

## Update interface

### `#getMyDid()` -> `get did()`

```shell
const networkMember = new CommonNetworkMember(password, encryptedSeed, options)

const did = networkMember.did
```

did - user's DID

### Remove `#userExists` from CommonNetworkMember

# [release 1.2.0](https://github.com/affinityproject/affinity-sdk/compare/1.1.26...affinityproject:1.2.0) (2020-03-11)

## Add interface

### Check if user exists in Affinity

```shell
const userExists = await CommonNetworkMember.userExists(username)
```

`userExists` - returns boolean value

### signIn - simple passwordless sign in or sign up, if user does not exist + DID creation

```shell
const token = await CommonNetworkMember.signIn(username)
```

`username` - email or phoneNumber, of existing Cognito user or if it
does not exist, a new one will be created

### confirmSignIn

```shell
const networkMember = await CommonNetworkMember.confirmSignIn(token, confirmationCode, options)
```

`token` - from previous step

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES.

`options` - optional, if not defined defaults will be used.

Method returns instance of CommonNetworkMember.

# [release 1.1.26](https://github.com/affinityproject/affinity-sdk/compare/1.1.25...affinityproject:1.1.26) (2020-03-10)

## Add interface

### Resend Signup confirmation code

```shell
await CommonNetworkMember.resendSignUpConfirmationCode(username)
```

username - Cognito email or phoneNumber

# [release 1.1.25](https://github.com/affinityproject/affinity-sdk/compare/1.1.23...affinityproject:1.1.25) (2020-03-10)

## Updated interfaces

### Updated Signup flow

```shell
const token = await CommonNetworkMember.signUp(username, password)
```

password - optional parameter, if will be not passed, then user will be able login only throw `passwordlessLogin`

username - is email or phoneNumber

```shell
const commonNetworkMember = await CommonNetworkMember.confirmSignUp(token, confirmationCode)
```

token - its token returned from previous step (signUp)

# [release 1.1.23](https://github.com/affinityproject/affinity-sdk/compare/1.1.19...affinityproject:1.1.23) (2020-03-09)

## New interfaces

### Add change username flow

```shell
const networkMember = new CommonNetworkMember(password, encryptedSeed, options)

await networkMember.changeUsername(newUsername)
```

`newUsername` - email or phone number

To confirm changing username:

```shell
await networkMember.confirmChangeUsername(newUsername, confirmationCode)
```

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES
to the `newUsername` which will be a new login method

### Add passwordless login flow

```shell
const token = await CommonNetworkMember.passwordlessLogin(username)
```

`username` - Cognito username, used as a login method

To complete passwordless login, confirmation code should be submitted:

```shell
const commonNetworkMember = await CommonNetworkMember.completeLoginChallenge(token, confirmationCode, options)
```

`token` - token from the previous step

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES

`options` - optional, if not defined defaults will be used.

### Add password recovery flow

```shell
await CommonNetworkMember.forgotPassword(username)
```

`username` - Cognito username, used as a login method

To confirm change password, confirmation code should be submitted:

```shell
await CommonNetworkMember.forgotPasswordSubmit(username, confirmationCode, newPassword)
```

`username` - Cognito username

`confirmationCode` - 6 digits code, generated and sent by AWS Cognito/SES

`newPassword` - new password

## Split services

Changed options optional params to initilize SDK instance:

```shell script
const options = {
  registryUrl: 'https://affinity-registry.dev.affinity-project.org',
  issuerUrl:   'https://affinity-issuer.dev.affinity-project.org',
  verifierUrl: 'https://affinity-verifier.dev.affinity-project.org'
}

const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
```

Added expiresAt param to signCredential

```shell
const expiresAt = '2021-03-06T15:13:51.970Z'
await signCredential(claim, claimMetadata, { requesterDid, credentialOfferResponseToken }, expiresAt)
```

# [release 1.1.19](https://github.com/affinityproject/affinity-sdk/compare/1.1.17...affinityproject:1.1.19) (2020-02-27)

## Add support for key management (Wallet storage service) <alpha version>

[How this works](https://swimlanes.io/u/n-wPd_s5b) (Encryption Keys Provider just mocked at this point)

### New interface

#### Signup user into Affinity:

```
await CommonNetworkMember.signUp(username password)
```

userName - email or phoneNumber

sms/email with verification code will be sended to appropriate login method

To confirm email/phoneNumber and finish registration:

```
await CommonNetworkMember.confirmSignUp(username, confirmationCode)
```

To store keys on Affinity Guardian Wallet:

```
await commonNetworkMember.storeEncryptedSeed(username password)
```

#### Initiate instance of sdk with login and pasword:

To initiate instance of networkMember using just login and password (when user already signed up at Affinity, and if stored his keys at Affinity Guardian Wallet)

```
const networkMember = await CommonNetworkMember.fromLoginAndPassword(username, password)
```
