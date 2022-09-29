# Affinity SDK for React Native.

> WARNING **Action required from you**  
> Update your services to use Affinidi SDK v6.0.4 or above.  
> Note please pay attention to the changelog while upgrading the version of SDK as some methods may be changed or deprecated.
> If you are using Affinidi SDK below v6, your application doesn’t support Affinidi Vault and hence we cannot migrate you out of the Bloom Vault.  
> With Affinidi SDK v6.0.4 onwards, we have also introduced automatic trigger of migration to Affinidi Vault and that is why we ask you to upgrade to that version or above.  
> Otherwise your credentials will never be migrated. The migration will not anyhow impact SDK performance negatively.  
> Furthermore, if you have more than 100 credentials in Bloom Vault the performance should be increased after migration.
> Bloom Vault is no longer supported with Affinidi SDK v7.

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

## How to use

Please refer to [`@affinidi/wallet-core-sdk` README](https://github.com/affinityproject/affinidi-core-sdk/tree/master/sdk/core)
