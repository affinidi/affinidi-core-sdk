# release 7.10.2 (2023-01-23)
* fix security vulnerabilities by upgrading jsonwebtoken and class-validator
# release 7.10.1 (2023-01-20)
* fixed `jsonld-signatures-bbs` version to `1.1.0` because of lib breaking changes;
* bumped `core` version. bumped `common` lib version in dev dependencies
# release 7.10.0 (2022-12-19)
* added an option for HolderService to resolve legacy elem locally
# release 7.9.1 (2022-12-09)
updated `getCredentials` to filter corrupted credentials without throwing exception
# release 7.9.0 (2022-12-07)
* added an option to pass custom before hook for document loader
# release 7.8.0 (2022-12-07)
* added a flag to resolve legacy elem locally
# release 7.7.0 (2022-11-29)
* add security fix for signIn passwordless flow
# release 7.6.0 (2022-11-29)
feat: add getInfo to NetworkMemberWithCognito
# release 7.5.1 (2022-11-25)
* bumped `core` version
# release 7.5.0 (2022-11-14)
* updated `url-resolver` with internal URLs for new dev environment
# release 7.4.0 (2022-11-10)
* updated `url-resolver` to move to new dev environment
# release 7.3.0 (2022-10-26)
* updated `@affinidi/wallet-core-sdk` to have an option to skip call to Regisrty `anchorDid` for didMethod `elem`
# release 7.2.1 (2022-10-27)
* Fix Security Vulnerabilities by patching `xmldom`
# release 7.2.0 (2022-10-20)
* updated to use usermanagement@2.x.x with random username generation during passwordless registration
# release 7.1.1 (2022-10-20)
* updated `common` to update DidResolver to have optional caching
# release 7.1.0 (2022-10-12)
* updated `common` to update deriveProof  to make "data" root field in credential subject not mandatory
# release 7.0.2 (2022-10-10)
* correct error codes for claim flow
# release 7.0.1 (2022-10-03)
* move common errors to tools-common
# release 7.0.0 (2022-09-28)
Breaking changes: 
* removed `Bloom Vault` usage and `Vault Migration Service` logic
# release 6.7.0 (2022-09-21)
* Expose `validateCredential method` to `BaseNetworkMember`
# release 6.6.0 (2022-09-21)
* Added `origin` to `AnchorDidInput`
# release 6.5.2 (2022-09-21)
* fix `credentialOfferResponseToken` method 
# release 6.5.1 (2022-09-13)
* add `claimCredentials` method
# release 6.5.0 (2022-09-06)
* upgraded to npm 8;
* updated vulnerable `@mattrglobal/jsonld-signatures-bbs` dependency;
* added `overrides` field to override vulnerable `node-forge` sub dependency(npm version >= 8.10.x).
# release 6.4.2 (2022-08-15)
* updated `@affinidi/affinidi-did-auth-lib` (did equality check uses short form)
# release 6.4.1 (2022-08-01)
* updated `@affinidi/vc-common` and `@affinidi/vc-data`
# release 6.4.0 (2022-07-08)
* add support of new did method "polygon"
# release 6.3.1 (2022-06-30)
* add new sdk options
    - `region` configure aws region use `DEFAULT_COGNITO_REGION` as default
# release 6.3.0 (2022-06-30)
* add login with refreshToken
# release 6.2.9 (2022-06-28)
* fix bug in a fetch credential logic
# release 6.2.8 (2022-06-28)
* add new sdk options
- `queryBloomVault` - query legacy credential store . `true` by default.
- `userPoolId` & `clientId` configure custom cognito pool & client. use environment specific settings by default
# release 6.2.7 (2022-06-22)
* updated `wallet-core-sdk`, `common` with BigInt fix for react native
# release 6.2.6 (2022-06-10)
* fix handling of user registration status incomplete
# release 6.2.5 (2022-06-06)
* update README to notify users use the latest versions with affinidi-vault support
# release 6.2.4 (2022-04-27)
* add optional `constraints` field to `CredentialRequirement`
# release 6.2.3 (2022-04-22)
* fix react native bug
# release 6.2.2 (2022-04-08)
fix passwordless signin for users with arbitrary user name
# release 6.2.1 (2022-04-03)
* Fix complete passwordless login operation
* minor fix of hashing functions for browser support
# release 6.2.0 (2021-12-09)
* Update BBS related libs
* Selective disclosure for nested fields
# release 6.0.0-beta.20 (2021-10-20)
Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.20
# release 6.0.0-beta.19 (2021-10-13)
Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.19
# release 6.0.0-beta.14 (2021-09-29)
Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.15
# release 6.0.0-beta.9 (2021-08-30)
* Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.9
* Implemented support for BBS and RSA (key generation, signature, verification)
# release 6.0.0-beta.6 (2021-08-13)
Refer to the changelog for `wallet-core-sdk` v6.0.0-beta.6
# release 6.0.0-beta.4 (2021-07-23)
* Updated `AffinidiWallet` to use new `WalletStorageService` interface
# release 6.0.0-beta.0 (2021-07-02)
* Initial release, in line with wallet-core-sdk version

