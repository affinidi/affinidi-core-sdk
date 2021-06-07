# release 4.3.1 (2021-06-07)
* Fixed DID validation
# release 4.3.0 (2021-06-04)
* Reorganized dependencies
# release 4.2.6 (2021-05-31)
* custom messages support for all methods
* updated OTP tests
# release 4.2.5 (2021-05-27)
* optional DTO fields are marked as TypeScript optional fields

# release 4.2.4 (2021-05-04)
* custom messages support for passwordless login
* vc-data winner schema

# release 4.2.3 (2020-04-01)
 * add optional pagination to `AffinityWallet.getCredentials`
 * add new method `AffinityWallet.getCredentialByIndex` that returns credentials given at the index
 * fix `AffinityWallet.signUp` returning CommonNetworkMember instead of Browser AffinityWallet
# release 4.2.2 
 * use new `vc-data` 
# release 4.2.0 (2020-02-16)
 * axios version update 
 * Documentation Updates 
 * `AffinityWallet.confirmSignUp` & `AffinityWallet.confirmSignIn` - fix default options handling.
 * `AffinityWallet.setEnvironmentVarialbles` return `env` as part of result options. 
 * Performance optimisation for revocable credentials. 
 
# release 3.0.0 (2020-11-03)

Drop the support of the test Api Key, thus it is crucial to make the update due to all earlier versions would be affected by that change.

# release 0.10.0 (2020-08-17)

## Update interface

### init - Initialize from user access token

Returns SDK instance when user is logged in and throws `COR-9 / UnprocessableEntityError`
if user is logged out.

```ts
const affinityWallet = await AffinityWallet.init(options)
```

`options` - optional, if not defined default settings will be used
