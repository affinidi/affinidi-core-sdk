# release 7.0.0 (2022-09-28)
Breaking changes: 
* removed `Bloom Vault` usage and `Vault Migration Service` logic
# release 6.6.0 (2022-09-21)
* Expose `validateCredential method` to `BaseNetworkMember`
# release 6.5.0 (2022-09-21)
* Added `origin` to `AnchorDidInput`
# release 6.4.1 (2022-09-13)
* add `claimCredentials` method
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
* updated `wallet-expo-sdk`, `common` with BigInt fix for react native
* # release 6.1.6 (2022-06-10)
* fix handling of user registration status incomplete
# release 6.1.5 (2022-06-06)
* update README to notify users use the latest versions with affinidi-vault support
# release 6.1.4 (2022-04-27)
* add optional `constraints` field to `CredentialRequirement`
# release 6.1.3 (2022-04-22)
* fix react native bug
# release 6.1.1 (2022-04-03)
* Fix complete passwordless login operation
* minor fix of hashing functions for browser support
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
* Breaking changes:
  * Removed caching credentials on client side
# release 5.0.1 (2021-06-21)
* Removed TestmailInbox from `__dangerous` to fix unnecessary `crypto-random-string` import
# release 5.0.0 (2021-06-16)
* `getCredentials` now returns all credentials (even if there are more than 100 of them)
* Performance optimization
* Retrieved credentials are cached even if no `credentialShareRequestToken` is passed to `getCredentials`
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
* optional DTO fields are marked a TypeScript optional fields

# release 4.2.4 (2021-05-04)
* custom messages support for passwordless login
* vc-data winner schema

# release 4.2.3 (2020-04-01)
 * add optional pagination to `AffinityWallet.getCredentials`
 * add new method `AffinityWallet.getCredentialByIndex` that returns credentials given at the index
 * fix `AffinityWallet.signUp` returning CommonNetworkMember instead of Expo AffinityWallet

# release 4.2.2 
 * use new `vc-data` 
# release 4.2.1 (2020-02-22)
 * axios version update 
# release 4.2.0 (2020-02-16)
 * Documentation Updates 
 * `AffinityWallet.confirmSignUp` & `AffinityWallet.confirmSignIn` - fix default options handling.
 * `AffinityWallet.setEnvironmentVarialbles` return `env` as part of result options. 
 
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

# release 0.5.0 (2020-07-09)

## metro.config.js update

`resolver.resolverMainFields` and `extraNodeModules.mobileRandomBytes` need to be added.

```diff
module.exports = {
  resolver: {
+   resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    extraNodeModules: {
+     mobileRandomBytes: require.resolve('@affinidi/wallet-expo-sdk/mobileRandomBytes'),
      crypto: require.resolve('@affinidi/wallet-expo-sdk/isNode'),
      stream: require.resolve('stream-browserify')
    }
  }
}
```

# release 0.4.6 (2020-06-25)

## `app.json` to be extended with a postPublish hook for Sentry:

```js
"expo": {
  // ... existing configuration
  "hooks": {
    "postPublish": [
      {
        "file": "sentry-expo/upload-sourcemaps",
        "config": {
          "organization": "Affinity",
          "project": "wallet-sdk",
          "authToken": "SENTRY_TOKEN"
        }
      }
    ]
  }
}
```

# release 0.4.2 (2020-06-24)

## Update list of required polyfills to be set for mapping in `metro.config.js`:

```js
module.exports = {
  resolver: {
    extraNodeModules: {
      // Polyfills for node libraries
      mobileRandomBytes: require.resolve('@affinidi/wallet-expo-sdk/mobileRandomBytes'),
      crypto: require.resolve('@affinidi/wallet-expo-sdk/isNode'),
      stream: require.resolve('stream-browserify'),
    },
  },
}
```

# release 0.1.12 (2020-04-30)

## Export only AffinityWallet

Instead of CommonNetworkMember / Wallet / Issuer / Verifier

```ts
import { AffinityWallet } from '@affinityprojecthub/wallet-browser-sdk'
```

# release 0.1.11 (2020-04-29)

## Update README

# release 0.1.10 (2020-04-28)

## Add interface

### init - Initialize from user access token

Returns SDK instance when user is logged in and throws `COR-9 / UnprocessableEntityError`
if user is logged out.

```ts
const affinityWallet = await AffinityWallet.init(options)
```

`options` - optional, if not defined default settings will be used
