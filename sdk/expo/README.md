# Affinity SDK for Expo

> Please note that versions `>=4.2.6 <=5.0.0` might not work properly (see [this PR](https://github.com/affinityproject/affinidi-core-sdk/pull/105)).
> 
> For `v5`, please use versions `>=5.0.1`.
> 
> For `v4`, please use version `4.2.5` or, even better, update to `v5`.

Expo SDK extends CORE SDK. Make sure to check the [CORE SDK documentation](https://www.npmjs.com/package/@affinidi/wallet-core-sdk).

## How to install

```shell script
npm i --save @affinidi/wallet-expo-sdk
```

## Setup Integration Tests

Test credentials should be added to the top level `.env` file. These contain usernames and passwords of pre-populated accounts on the staging environment. Reach out to a team member for instructions on how to set up this file, or to obtain a copy.

## Mapping

You may need some polyfills as some of the dependencies assume running in a Node environment.

Also need to configure your bundler (webpack, parcel, metro, etc.) with aliases for the modules named ..-browserify
in metro.config.js:

```js
module.exports = {
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    extraNodeModules: {
      // Polyfills for node libraries
      mobileRandomBytes: require.resolve('@affinidi/wallet-expo-sdk/mobileRandomBytes'),
      crypto: require.resolve('@affinidi/wallet-expo-sdk/isNode'),
      stream: require.resolve('stream-browserify'),
    },
  },
}
```

### TextEncoder issue

In case `TextEncoder not found` error for React Native / Expo on making bundle,
add the following to your `index.js` or `App.js`:

```js
import * as encoding from 'text-encoding'
```

## Sentry - crash reporting

Extend `app.json` and add a postPublish hook:

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

## How to use

Please refer to [`@affinidi/wallet-core-sdk` README](https://github.com/affinityproject/affinidi-core-sdk/tree/master/sdk/core)
