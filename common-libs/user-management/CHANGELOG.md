# release 2.5.5 (2023-02-23)
* added COR-33 & COR-34 error handling
# release 2.5.4 (2023-02-15)
* added `errors` getter with existing errors codes list for `SdkErrorFromCode`
* bumped `tools-common`
# release 2.5.3 (2023-02-09)
* bumped `common`, `tools-common`, `internal-api-clients` libs
# release 2.5.2 (2023-02-03)
* added COR-32 error
# release 2.5.1 (2023-01-30)
* return getTrueCallerUrl method to TrueCallerService
# release 2.5.0 (2023-01-29)
* updated cognito client to v3 and allow inject it as dependency
# release 2.4.0 (2023-01-27)
* added caching of Truecaller public key
# release 2.3.2 (2023-01-26)
* extended Cognito `verify-auth` lambda's errors handling
# release 2.3.1 (2023-01-20)
* bumped `internal-api-clients`, `common` versions
# release 2.3.0 (2022-11-29)
* add security fix for signIn passwordless flow
# release 2.2.0 (2022-11-29)
feat: add getInfo()
# release 2.1.0 (2022-11-22)
* Added `signUpWithProfile` and `logInWithProfile` methods.
* Added `TrueCallerService` class for handling `Truecaller flow` specific operations.
# release 2.0.0 (2022-10-20)
BREAKING CHANGES:
* username building strategy was changed to use uuidV4 as username  
  when email or phone is used for passwordless flow.  
  Before the username was derived from email / phone by replacing '@' for email or '+' for phone with '_'
# release 1.7.0 (2022-10-03)
* handle double confirmation issue on confirm sign-up 
* move common-errors to tools-common
# release 1.6.0 (2022-09-28)
* updated `internal-api-clients`
# release 1.5.0 (2022-09-06)
* upgraded to npm 8;
* switched off error on `no-unused-vars` lint rule.
# release 1.4.0 (2022-06-30)
* add logInWithRefreshToken auth method
# release 1.3.1 (2022-06-22)
* updated `internal-api-clients`, `tools-common` with BigInt fix for react native
# release 1.3.0 (2022-06-10)
* add logic to work with user registration status
  * in the start of signUp flow mark user registration status as `incomplete` and in the end - `complete`
  * in the login flow check if user registration status is `complete`, otherwise remove user and return error
# release 1.2.3 (2022-04-22)
* fix react native bug
# release 1.2.2(2022-04-08)
* Fix `doesConfirmedUserExist` to work with changes user email and phone
# release 1.2.1 (2022-04-03)
* Fix confirmation cognito session caching for passwordless flow 
# release 1.1.0 (2021-12-07)
* Updated `internal-api-clients` (removing dependency on `node-fetch` and `undici`)
# release 1.0.0 (2021-11-21)
* Initial commit (code migrated from `wallet-core-sdk`)
