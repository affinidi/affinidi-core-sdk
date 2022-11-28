# release 2.2.0 (2022-11-28)
feat: add adminGetUserInfo
# release 2.1.0 (2022-10-20)
* updated api of KeysService
# release 2.0.0 (2022-09-28)
Breaking changes: 
  * removed `Bloom Vault` usage and `Vault Migration Service` logic
# release 1.7.0 (2022-09-21)
* Added `origin` to `AnchorDidInput`
# release 1.6.0 (2022-09-06)
* upgraded to npm 8;
* updated `ts-node` and `typedoc` versions;
* switched off error on `no-unused-vars` lint rule.
# release 1.5.1 (2022-07-22)
* Updated `tools-openapi` version
# release 1.5.0 (2022-07-08)
* Updated registry spec
# release 1.4.0 (2022-06-30)
  * Updated `keyStorageApiService` with new endpoint `/userManagement/adminLogOutUser`
# release 1.3.1 (2022-06-22)
  * Updated `tools-common`, `tools-openapi` with BigInt fix for react native
# release 1.3.0 (2022-06-08)
  * Updated KeyStorageApiService to support AdminDeleteIncompleteUser feature
# release 1.2.0 (2021-12-07)
  * Updated `tools-openapi` (removing dependency on `node-fetch` and `undici`)
# release 1.1.1 (2021-11-29)
  * Added support for migration service
# release 1.1.0 (2021-11-19)
  * Common reusable code extracted into a `tools-openapi` package
# release 1.0.0 (2021-11-19)
  * Removed 'beta' suffix
# release 1.0.0-beta.15 (2021-11-12)
  * Added `undici` as alternative http client
# release 1.0.0-beta.14 (2021-10-20)
  * Added `CloudWalletApiService.prototype.signJwt`
# release 1.0.0-beta.13 (2021-10-13)
  * removed dependency on did-auth-lib
  * removed `DidAuthAdapter`, users should implement their own instead (compatible with `DidAuthAdapterType`)
# release 1.0.0-beta.12 (2021-09-29)
  * did-auth-lib version changed from 1.0.8 to 1.1.0
# release 1.0.0-beta.11 (2021-09-09)
  * Inheritance replaced with composition
  * `@affinidi/common` dependency replaced with `@affinidi/tools-common`
# release 1.0.0-beta.8 (2021-08-02)
  * Created abstract `DidAuthApiService` and moved all Did auth related logic into it
# release 1.0.0-beta.7 (2021-07-30)
  * Added `CloudWalletApiService`
  * Actualized `openapi` swagger specs
  * Added one more endpoint into the `IssuerApiService`
# release 1.0.0-beta.6 (2021-07-26)
  * Moved headers management to `helpers` module
  * Added `X-SDK-Version` header
  * Added optional `sdkVersion` parameter to GenericApiService constructor options
# release 1.0.0-beta.5 (2021-07-23)
  * Fixed passing empty `types` to `searchCredentials` in `AffinidiVaultApiService`
# release 1.0.0-beta.4 (2021-07-23)
  * Refactored typescript types
# release 1.0.0-beta.3 (2021-07-19)
  * Initial commit (code migrated from `wallet-core-sdk`)
  * Implemented `AffinidiVaultApiService`
