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
* optional DTO fields are marked as TypeScript optional fields

# release 4.2.4 (2021-05-04)
* custom messages support for passwordless login
* vc-data winner schema

# release 4.2.3 (2020-04-01)
 * add optional pagination to `AffinityWallet.getCredentials`
 * add new method `AffinityWallet.getCredentialByIndex` that returns credentials given at the index
 * fix `AffinityWallet.signUp` returning CommonNetworkMember instead of React Native AffinityWallet

# release 4.2.2 
 * use new `vc-data`
# release 4.2.1 (2020-02-22)
 * axios version update 
# release 4.2.0 (2020-02-16)
 * axios version update 
 * Documentation Updates 
 * `AffinityWallet.confirmSignUp` & `AffinityWallet.confirmSignIn` - fix default options handling.
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

# release 0.2.0 (2020-07-09)

## metro.config.js update

`resolver.resolverMainFields` and `extraNodeModules.mobileRandomBytes` need to be added.

```diff
module.exports = {
  resolver: {
+   resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    extraNodeModules: {
+     mobileRandomBytes: require.resolve('@affinidi/wallet-expo-sdk/mobileRandomBytes'),
      crypto: require.resolve('@affinidi/wallet-expo-sdk/isNode'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify')
    }
  }
}
```
