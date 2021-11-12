# release 2.0.0-beta.2 (2021-11-03)
* Added `@affinidi/url-resolver` dependency
* Replaced predefined Affinity services urls from config with resolveUrl function from `@affinidi/url-resolver`
# release 2.0.0-beta.1 (2021-10-20)
* Implemented `DidAuthClientService`, `DidAuthServerService`, `DidAuthCloudService`.
* `DidAuthService` is now deprecated.
* `node-fetch` dependency replaced with `internal-api-clients` dependency.
* In order to simplify dependencies:
  * `DidAuthClientService` constructor now accepts `Signer` as a parameter;
  * `DidAuthServerService`: short-form verifier did, signer and `Affinidi` instance;
    * `createDidAuthRequestToken` accepts short-form audience did.
  * `DidAuthCloudService`: `CloudWalletApiService`.
# release 2.0.0-beta.0 (2021-10-13)
* Code imported into monorepo from private repository
