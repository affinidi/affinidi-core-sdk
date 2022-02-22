# Affinity SDK for React Native.

> Please note that versions `>=4.2.6 <=5.0.0` might not work properly (see [this PR](https://github.com/affinityproject/affinidi-core-sdk/pull/105)).
> 
> For `v5`, please use versions `>=5.0.1`.
> 
> For `v4`, please use version `4.2.5` or, even better, update to `v5`.

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
  amazon-cognito-identity-js assert events react-native-webview react-native-webview-crypto
```

```shell script
react-native link
```

Go to ios folder of your project

```shell script
pod install
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

Add following code to you jsx or tsx file where you will be calling the `signUnsignedCredential` method of the wallet

```js
import WebviewCrypto from 'react-native-webview-crypto';
```
Add following code to the same file in its view hierarchy as a child element

```jsx
<WebviewCrypto />
```

### TextEncoder issue

In case `TextEncoder not found` error for React Native on making bundle,
add the following to your `index.js` or `App.js`:

```js
import * as encoding from 'text-encoding'
```

## How to use

Please refer to [`@affinidi/wallet-core-sdk` README](https://github.com/affinityproject/affinidi-core-sdk/tree/master/sdk/core)

