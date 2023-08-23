# release 3.3.2 (2023-08-23)
* Full did Support & added validation on expiresAt
# release 3.3.0 (2023-08-16)
* Add support for the did key method and public Key JWK format
# release 3.2.0 (2023-05-30)
* remove metrics service
# release 3.1.0 (2023-03-14)
* add tenant token
# release 3.0.1 (2023-02-10)
* Update vc common lb, extend presentation submission 
# release 3.0.0 (2023-03-08)
* added KeyManager abstraction, all operations with Private Key moved to KeyManager
# release 2.14.0 (2023-03-07)
* add optional parameter `accountNumber` for wallet initialization to derive custom account `keys`/`did`
from the root `seed`(could be used to create several ephemeral DIDs to support not traceability option).
# release 2.13.0 (2023-02-09)
* add an optional field `challenge` to the `validatePresentation` method;
* bumped `vc-common`, `vc-data`, `tools-common`, `internal-api-clients`, `tools-openapi` libs versions.
# release 2.12.0 (2023-01-24)
* add new `did:web` method support
# release 2.11.1 (2023-01-20)
* bumped `internal-api-clients` version
# release 2.11.0 (2022-12-07)
* added an option to pass custom before hook for document loader
# release 2.10.0 (2022-12-07)
* added a flag to resolve legacy elem locally
# release 2.9.1 (2022-11-29)
* add security fix for signIn passwordless flow
# release 2.9.0 (2022-11-28)
* updated `internal-api-clients`
# release 2.8.0 (2022-11-14)
* updated `url-resolver` with internal URLs for new dev environment
# release 2.7.0 (2022-11-10)
* updated `url-resolver` to move to new dev environment
# release 2.6.0 (2022-10-20)
* updated DidResolver to have optional caching
# release 2.5.0 (2022-10-12)
* updated deriveProof  to make "data" root field in credential subject not mandatory
# release 2.4.0 (2022-09-28)
* updated `internal-api-clients` and `url-resolver`
# release 2.3.0 (2022-09-06)
* upgraded to npm 8;
* updated `mocha` version.
# release 2.2.1 (2022-08-01)
* updated `vc-data` and `vc-common`
# release 2.2.0 (2022-07-08)
* Added support of new did method "polygon"
# release 2.1.7 (2022-06-30)
* updated `internal-api-clients` with new endpoint
# release 2.1.6 (2022-06-22)
* updated `internal-api-clients`, `tools-common` with BigInt fix for react native
# release 2.1.5 (2021-04-22)
* fix react native bug
# release 2.1.2 (2022-03-11)
* fixed a minor bug in selective disclosure of nested fields
# release 2.1.1 (2021-12-09)
* add jsonld wrapper for dependents libs
* implemented support for selective disclosure of nested fields
# release 2.1.0 (2021-12-07)
* Updated `internal-api-clients`
* Removed dependency on `node-fetch` and `undici`
# release 2.0.0-beta.21 (2021-11-03)
* Added `@affinidi/url-resolver` dependency
* Replaced predefined Affinity services urls from config with resolveUrl function from `@affinidi/url-resolver`
# release 2.0.0-beta.20 (2021-10-20)
* `getKeyId` method in `...DidDocumentService` no longer accepts `did` parameter.
* `getKeyId` now always builds key ID using short-form DID.
* `KeysService.signJwt` now always writes DID to `iss` field and key id to `kid` field.
# release 2.0.0-beta.12 (2021-09-30)
* add support of elem-anchored method
# release 2.0.0-beta.11 (2021-09-29)
Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.15
# 2.0.0-beta.10 (2021-09-22)
* Support for storing metadata in seed
* Support for seed method elem-anchored
# 2.0.0-beta.9 (2021-09-15)
* Support for ecdsa keys in seed generation
# 2.0.0-beta.8 (2021-09-09)
* DIDs are now resolved using `RegistryApiService` from `@affinidi/internal-api-clients`
* Resolved DIDs are cached
# 2.0.0-beta.7 (2021-08-30)
* `Affinity` constructor now requires `IPlatformCryptographyTools` parameter
* Implemented support for BBS and RSA (key generation, signing, validation), if relevant `IPlatformCryptographyTools` is provided
* Improved types
* New `generateSeed` method is exported
* Document loader now caches schemas loaded frow w3.org and w3id.org
# 2.0.0-beta.6 (2021-08-23)
* export `LocalKeyService`
* Add `asyncSign` to `KeyVault` to simplify usage of the library in async contexts
* export `LocalKeyService` implements `asyncSign`
# 2.0.0-beta.5 (2021-08-20)
* `ElemDidDocument` abstracted to use a KeyVault to provide the relevant keys
# 2.0.0-beta.4 (2021-07-23)
* Fixed initializing `externalKeys` in `KeysService`
# 2.0.0-beta.3 (2021-07-19)
* Internal changes
# 2.0.0-beta.1 (2021-06-29)
* Improved type declarations
* Breaking changes
  * `KeysService.getSigningKey` and `getKey` made private. Use one of the following alternatives instead:
    * `getPublicKey`
    * `getPrivateKey`
    * `getPublicAndPrivateKeys`
    * `getAnchorTransactionPublicKey`
    * `getAnchorTransactionPrivateKey`
    * `getAnchorTransactionPublicAndPrivateKeys`
# 1.9.0 (2020-06-16)
* Declared input and output types on `KeysService` methods
* Implemented `KeysService.getOwnPublicKey` and `KeysService.getOwnPrivateKey`
# 1.8.0 (2020-06-04)
* Reorganized dependencies
# 1.6.0 (2020-02-16)
* Performance improvement. Add revocable credential context url to [local context](./src/_baseDocumentLoader/localContexts.ts) .
