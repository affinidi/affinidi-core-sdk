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
