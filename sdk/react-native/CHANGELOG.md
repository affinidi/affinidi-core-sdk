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
