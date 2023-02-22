# release 7.10.7 (2023-02-22)
* update VC type to support multiple(array) proof.
# release 7.10.6 (2023-02-15)
* bumped `core` version.
# release 7.10.5 (2023-02-09)
* bumped `core` version. bumped `common` lib version in dev dependencies
# release 7.10.4 (2023-02-09)
* removed redundant call to check if unconfirmed user exist
# release 7.10.3 (2023-02-03)
* added COR-32 error
# release 7.10.2 (2023-01-30)
* bumped `core` version
# release 7.10.1 (2023-01-30)
* bumped `user-management` lib version
# release 7.10.0 (2023-01-29)
* updated user-management lib and allow to inject cognito client into that
# release 7.9.5 (2023-01-27)
* bumped `core` version
# release 7.9.4 (2023-01-26)
* bumped `core` version
# release 7.9.3 (2023-01-24)
* add new `did:web` method support
# release 7.9.2 (2023-01-23)
* fix security vulnerabilities by upgrading jsonwebtoken and class-validator
# release 7.9.1 (2023-01-20)
* bumped `core` version. bumped `common` lib version in dev dependencies
# release 7.9.0 (2022-12-19)
* added an option for HolderService to resolve legacy elem locally
# release 7.8.1 (2022-12-09)
updated `getCredentials` to filter corrupted credentials without throwing exception
# release 7.8.0 (2022-12-07)
* added an option to pass custom before hook for document loader
# release 7.7.0 (2022-12-07)
* added a flag to resolve legacy elem locally
# release 7.6.0 (2022-11-29)
feat: add getInfo to NetworkMemberWithCognito
# release 7.5.1 (2022-11-25)
* bumped `core` version
# release 7.5.0 (2022-11-14)
* updated `url-resolver` with internal URLs for new dev environment
# release 7.4.0 (2022-11-10)
* updated `url-resolver` to move to new dev environment
# release 7.3.0 (2022-10-26)
* updated `@affinidi/wallet-core-sdk` to have an option to skip call to Regisrty `anchorDid` for didMethod `elem`
# release 7.2.0 (2022-10-20)
* updated to use usermanagement@2.x.x with random username generation during passwordless registration
# release 7.1.1 (2022-10-20)
* updated `common` to update DidResolver to have optional caching
# release 7.1.0 (2022-10-12)
* updated `common` to update deriveProof  to make "data" root field in credential subject not mandatory
# release 7.0.2 (2022-10-10)
* correct error codes for claim flow
# release 7.0.1 (2022-10-03)
* move common errors to tools-common
# release 7.0.0 (2022-09-28)
Breaking changes: 
* removed `Bloom Vault` usage and `Vault Migration Service` logic
# release 6.6.0 (2022-09-21)
* Expose `validateCredential method` to `BaseNetworkMember`
# release 6.5.0 (2022-09-21)
* Added `origin` to `AnchorDidInput`
# release 6.4.0 (2022-09-06)
* upgraded to npm 8;
* updated vulnerable `typedoc` dependency.
# release 6.3.2 (2022-08-15)
* updated `@affinidi/affinidi-did-auth-lib` (did equality check uses short form)
# release 6.3.1 (2022-08-01)
* updated `@affinidi/common` and `@affinidi/wallet-core-sdk`
# release 6.3.0 (2022-07-08)
* add support of new did method "polygon"
# release 6.2.1 (2022-06-30)
* add new sdk options
  - `region` configure aws region use `DEFAULT_COGNITO_REGION` as default
# release 6.2.0 (2022-06-30)
* add login with refreshToken
# release 6.1.9 (2022-06-28)
* fix bug in a fetch credential logic
# release 6.1.8 (2022-06-28)
* add new sdk options
- `queryBloomVault` - query legacy credential store . `true` by default.
- `userPoolId` & `clientId` configure custom cognito pool & client. use environment specific settings by default
# release 6.1.7 (2022-06-22)
* updated `common`, `wallet-core-sdk` with BigInt fix for react native
# release 6.1.6 (2022-06-10)
* fix handling of user registration status incomplete
# release 6.1.5 (2022-06-06)
* update README to notify users use the latest versions with affinidi-vault support
# release 6.1.4 (2022-04-27)
* add optional `constraints` field to `CredentialRequirement`
# release 6.1.3 (2022-04-22)
* fix react native bug
# release 6.1.2 (2022-04-08)
fix passwordless signin for users with arbitrary user name
# release 6.1.1 (2022-04-03)
* Fix complete passwordless login operation
# release 6.0.0-beta.20 (2021-10-20)
Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.20
# release 6.0.0-beta.19 (2021-10-13)
Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.19
# release 6.0.0-beta.14 (2021-09-29)
Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.15
# release 6.0.0-beta.9 (2021-08-30)
Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.9
# release 6.0.0-beta.6 (2021-08-13)
Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.6
# release 6.0.0-beta.4 (2021-07-23)
* Updated `AffinidiWallet` to use new `WalletStorageService` interface
# release 5.0.1 (2021-06-21)
* Removed TestmailInbox from `__dangerous` to fix unnecessary `crypto-random-string` import
# release 5.0.0 (2021-06-16)
* `getCredentials` now returns all credentials (even if there are more than 100 of them)
* Performance optimization
* Also refer to the changelog for `common` v1.9.0
* Also refer to the changelog for `wallet-core-sdk` v5.0.0
* Breaking changes:
  * `getCredentials` no longer accepts pagination parameters
  * Some methods that returned arrays now declare their return type as `any[]` instead of `any`.
  * Some methods that accepted arrays now accept `unknown[]` instead of `any`.
  * Removed `KeysService` and `WalletStorageService`
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
 * add optional pagination to `AffinityWallet.getCredentials`
 * add new method `AffinityWallet.getCredentialByIndex` that returns credentials given at the index
 * fix `AffinityWallet.signUp` returning CommonNetworkMember instead of Browser AffinityWallet
# release 4.2.2 
 * use new `vc-data` 
# release 4.2.0 (2020-02-16)
 * axios version update 
 * Documentation Updates 
 * `AffinityWallet.confirmSignUp` & `AffinityWallet.confirmSignIn` - fix default options handling.
 * `AffinityWallet.setEnvironmentVarialbles` return `env` as part of result options. 
 * Performance optimisation for revocable credentials. 
 
# release 3.0.0 (2020-11-03)

Drop the support of the test Api Key, thus it is crucial to make the update due to all earlier versions would be affected by that change.

# release 0.10.0 (2020-08-17)

## Update interface

### init - Initialize from user access token

Returns SDK instance when user is logged in and throws `COR-9 / UnprocessableEntityError`
if user is logged out.

```ts
const affinityWallet = await AffinityWallet.init(options)
```

`options` - optional, if not defined default settings will be used
