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

