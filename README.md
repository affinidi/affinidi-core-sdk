# Affinidi SDK Monorepo

The open-source [Affinidi Library](https://github.com/affinityproject/affinidi-core-sdk) provides easy-to-use Typescript packages that enable developers to create and manage true certificate-enabled Digital Identities (DID) on the Affinidi Network.

The Affinidi open source monorepo has the following structure

```
.
├── common-libs
│   ├── common
│   ├── tiny-lds-ecdsa-secp256k1-2019
│   ├── did-auth-lib
│   ├── internal-api-clients
│   ├── tools-common
│   ├── tools-openapi
│   ├── url-resolver
│   ├── user-management
│   └── vc-common
│
└── platform
│   ├── fetch
│   ├── fetch-native
│   └── fetch-node
│
└── sdk
    ├── browser
    ├── core
    ├── expo
    ├── issuer-kit
    ├── node
    ├── react-native
    └── vc-data
```

### common-libs/common
The `common` folder contains the `@affinidi/common` [npm package](https://www.npmjs.com/package/@affinidi/common). This package implements DID, VC, and VP utilities that are used throughout Affinidi libraries and services. This package is considered more *opinionated* because it supports DID methods and VC proofs that Affinidi actively supports.

The main entry point to this package is a class called `Affinity`. In this class you will find utilities for handling JSON-LD, DIDs, VCs, VPs, JWTs, and legacy credential types from early MVPs.

### common-libs/tiny-lds-ecdsa-secp256k1-2019
This packages is the same as https://github.com/decentralized-identity/lds-ecdsa-secp256k1-2019.js, but uses `tiny-secp256k1` for signing.

### common-libs/did-auth-lib
The `did-auth-lib` folder contains the `@affinidi/affinidi-did-auth-lib` [npm package](https://www.npmjs.com/package/@affinidi/affinidi-did-auth-lib). This library allows proving that the client/user is the owner of provided `DID`. Based on this proof App builders can give the client/user access to the appropriate resources.

### common-libs/vc-common
The `vc-common` folder contains the `@affinidi/vc-common` [npm package](https://www.npmjs.com/package/@affinidi/vc-common). This package implements VC and VP types and utility functions that help with type-safe credential issuance and verification. It is considered less *opinionated* because it supports a wider variety of DIDs and VCs as long as they conform to the core data model.

Find more docs [here](https://docs.affinity-project.org/common/getting-started).

### sdk/core
The `core` folder contins the `@affinidi/wallet-core-sdk` [npm package](https://www.npmjs.com/package/@affinidi/wallet-core-sdk). This package implements the common logic for account registration & management, credential issuance & verification and more.

The main entry point is a class called `CommonNetworkMember`. This class can be initialized with specific service endpoints, or if left to it's defaults will use Affinidi's staging environment.

### sdk/browser
The `browser` folder contains the `@affinidi/wallet-browser-sdk` [npm package](https://www.npmjs.com/package/@affinidi/wallet-browser-sdk). This package extends the `wallet-core-sdk` logic with client specific implementations for crypto operations. As a result of crypto operations being platform specific, this package implements the logic to communicate with the encrypted data vault for VC storage.

The main entry point is a class called `AffinidiWallet`. Similar to `CommonNetworkMember`, the class can be initialized with specific service endpoints, or can be left to use Affinidi's staging environment by default.

### sdk/expo
The `expo` folder contains the `@affinidi/wallet-expo-sdk` [npm package](https://www.npmjs.com/package/@affinidi/wallet-expo-sdk). This package extends the `wallet-core-sdk` logic with client specific implementations for crypto operations. As a result of crypto operations being platform specific, this package implements the logic to communicate with the encrypted data vault for VC storage.

The main entry point is a class called `AffinidiWallet`. Similar to `CommonNetworkMember`, the class can be initialized with specific service endpoints, or can be left to use Affinidi's staging environment by default.

### sdk/react-native
The `react-native` folder contains the `@affinidi/wallet-react-native-sdk` [npm package](https://www.npmjs.com/package/@affinidi/wallet-react-native-sdk). This package extends the `wallet-core-sdk` logic with client specific implementations for crypto operations. As a result of crypto operations being platform specific, this package implements the logic to communicate with the encrypted data vault for VC storage.

The main entry point is a class called `AffinidiWallet`. Similar to `CommonNetworkMember`, the class can be initialized with specific service endpoints, or can be left to use Affinidi's staging environment by default.

### sdk/vc-data
The `vc-data` folder contains the `@affinidi/vc-data` [npm package](https://www.npmjs.com/package/@affinidi/vc-data). This package contains schema helpers and building blocks to issue JSON-LD credentials. The `vc-data` utilities also specify a process through which developers can propose additions or request assistance in schema development.

### sdk/issuer-kit
The `issuer-kit` folder contains the `@affinidi/issuer-kit` [npm package](https://www.npmjs.com/package/@affinidi/issuer-kit). This package contains a framework for launching microservices to connect to external data providers & issue VCs.

## Prerequisites
Before we begin, make sure you have the following installed:

- Node.js v16.17.0 or later
- npm v8.15.0 or later

## API Key
You need to to use an API Key when you initialize the SDK. Here are the steps required to generate and start using the API Key: https://github.com/affinityproject/affinidi-core-sdk/tree/master/sdk/core#create-api-key

## npm commands

The following commands should be supported by all projects in monorepo

* `build`: should build package
* `lint`: should run lint
* `checkLicenses`: should check licenses
* `test:unit`: should run unit tests, if any
* `test:integration`: should run integration tests, if any
* `test`: should run all tests
* `test:coverage`: should run all tests with coverage
* `test:coverage:codeclimate`: should run `test:coverage` and save codeclimate results

Workflow to publish npm packages is:
1. `npm run bootstrap` in order to link and install all dependencies;
2. `npm run build` in order to build all projects in this monorepo;
3. `npm run lint`, `npm run test`, `npm run checkLicenses` etc;
4. `npm run publish`.

Note that `prepare` command is not required as the projects are built on step 2 anyway, and `prepare` command is run for all projects during step 1, making it unnecessary long.
