# release 2.9.0 (2023-03-14)
* add tenant token
# release 2.8.0 (2023-03-08)
* updated to use latest common lib
# release 2.7.0 (2023-03-07)
* add optional parameter `accountNumber` for wallet initialization to derive custom account `keys`/`did`
  from the root `seed`(could be used to create several ephemeral DIDs to support not traceability option).
# release 2.6.0 (2023-02-17)
* added .env.example for testing the lib locally.
* `DEV_API_KEY_HASH` variable must be set up as a part of `TEST_SECRETS` locally.
# release 2.5.5 (2023-02-09)
* bumped `common`, `tools-common`, `internal-api-clients` libs versions
# release 2.5.3 (2023-01-20)
* bumped `internal-api-clients`, `common` versions
# release 2.5.2 (2022-11-29)
* add security fix for signIn passwordless flow
# release 2.5.1 (2022-11-28)
* updated `internal-api-clients`
# release 2.5.0 (2022-11-14)
* updated `url-resolver` with internal URLs for new dev environment
# release 2.4.0 (2022-11-10)
* updated `url-resolver` to move to new dev environment
# release 2.3.0 (2022-09-28)
* updated `@affinidi/common`, `internal-api-clients` and `url-resolver`
# release 2.2.0 (2022-09-06)
* upgraded to npm 8;
* updated `mocha` version.
# release 2.1.7 (2022-08-15)
* did equality uses short dids
# release 2.1.6 (2022-08-09)
* updated `README.md`, added code examples and up-to-date explanations
# release 2.1.5 (2022-08-01)
* updated `@affinidi/common` with updated `vc-data` and `vc-common`
# release 2.1.4 (2022-06-30)
* updated `internal-api-clients` with new endpoint
# release 2.1.3 (2022-06-22)
* fixed `jsontokens` version to 3.0.0 for avoid BigInt error on react native
# release 2.1.2 (2021-04-22)
* fix react native bug
# release 2.1.0 (2021-12-07)
* Updated `internal-api-clients` and `common` (removing dependency on `node-fetch` and `undici`)
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
