# Affinidi Did Auth Helpers

## Usage:

This library allows proving that the client/user is the owner of provided `DID`. Based on this proof App builders can give the client/user access to the appropriate resources.

`Did-Auth` flow is similar to the `Sharing VC` flow, but without `VC` exchanges, since `DID` itself should be enough info from the client/user to authenticate. [Flow diagram.](https://www.planttext.com/api/plantuml/png/dLHBRzf04BxlhnZHIoAHY4Gz8RK9ITMeLNefKNE8E2nuY4TPTjtTCS6j-j-xwnT-WT9oi0pCzvXlF_lQiRISRfHWOeNmYIAOfHp3PsLUXLYQ7Onk5Q7c4Roxf-UOxooY5k0_YKVIYXAf6KOry9wMLjfi1D91H97qlwro0e0-QfOaYbQIoUWSK4-YZi2B5mRcQBTeAmCtAiK-KvYX5UOihhZ_DvErfD264OnNh8Z6fQyft263nPyfEWOsBwZFHMdvx6CrFOMLHSdenOBMzsBy8KoV5CF-dzCXbTB956vpWgxICKHE3xXBoA83qd016zAf1ompY70jKyNdeiG5ipNo3MR75V6Chqv5YMnjF6TB-Xc-FZx0asrmBFQIVhnAyN8owOprd3TiD_PkzMb_AdLSBZ7QOJ-l0xX-Q9SGczIwLcZL0Uz3g_2Tw0hr8hlcTcFu3Hkvo-z_I4NH5_tDNS6VEig6GaNT3hJ1l3XMptdeiDHPtPnNyWV5SJURK7lfhrxRMFgLFtyGeupG3XOwS9RLUFICOTsJumtEznmwbA4AUWfQPmToR7mBGQBUZa4cTFQ2MOXGAeRM46o3TFxi3pNrnYZqgpzj2uD-SI_epna-0DiK5pcmORAAjYfjkOtamKmM0fN3ZY7I_srfBJtTOK_l9nTlygGZ8QxzDRpd_m80)

The high-level perspective of `Did-Auth` flow looks like `request` → `response` → `validation of response`, where a response is a response(signed with the private key) to the challenge from the request.

For simplicity DID methods provided by SDK can be used for the implementation `Did-Auth` flow:

### Implementation of DID Auth flow using `AffinidiDidAuthService` class

Implementation might be consists of two parts - the client side and the service side.
The service side should provide some endpoints or trigger methods for the client to start the auth flow.
Both clients and service can set a token timeout, during validation min(service token timeout, client token timeout) will be used.

#### Initiate `AffinidiDidAuthService` class (service side)

`Did auth` flow should be implemented e.g. on the service side on which the user wants to log in.
Simplest way is to initialize `AffinidiDidAuthService` class with `encryptedSeed` and `encryptionKey` options.
For the client-side could be used the same approach, but with the client `encryptedSeed` and `encryptionKey`.

```ts
/**
 * sericeEncryptedSeed {String} (required) - encrypted seed, previously generated for service
 * serviceEncryptionKey {String} (required) - encreption key, previously generated for service
  */
const affinidiDidAuthService = new AffinidiDidAuthService({
  encryptedSeed: sericeEncryptedSeed,
  encryptionKey: serviceEncryptionKey,
})
```

Also `AffinidiDidAuthService` could be created using `did`, `keyId`, `keyVault` as options.
This approach is for batter backward compatibility. If needed more low-level implementation could be created with the `DidAuthServerService` class for the service side and the `DidAuthClientService` class for the client side.

```ts
import { KeysService, KeyVault, DidDocumentService, LocalKeyVault } from '@affinidi/common'

const keyService = new KeysService(sericeEncryptedSeed, serviceEncryptionKey)
const documentService = DidDocumentService.createDidDocumentService(keyService)
/**
 * did {String} - anchored did of the local entity
 * keyId {String} - key id used for signing, defaults to `<did>#primary`
 * keyVault {KeyVault} - key store backed implementation when the seed is known, holding signing keys
 */
const affinidiDidAuthService = new AffinidiDidAuthService({
  did: documentService.getMyDid(),
  keyId: documentService.getKeyId(),
  keyVault: new LocalKeyVault(keyService),
})
```

#### Creation of the request token(service side)

Client DID(ownership of which client is proved) might be provided. Use `createDidAuthRequestToken` method to create `Did-Auth` request token(expires in 1 minute by default). That request token is a JWT signed with the service's public key.
It should be sent back to the client for further steps.

```ts
/**
 * audienceDid {String} - audience DID of generated JWT request token (the one's DID to whom the token was sent)
 * expiresAt {Number} (optional) - expires (at specified time) of generated JWT request token (1 minute by default)
 */
const authDidRequestToken = await affinidiDidAuthService.createDidAuthRequestToken(audienceDid, expiresAt)
```

#### Building of the response token(client side)

To create a response token it is recommended to initialize the `AffinidiDidAuthService` class with `encryptedSeed` and `encryptionKey` options on the client side in the same way as for the service side.
Use `createDidAuthResponseToken` method to create `Did-Auth` response token(expires in 12 hours by default). It is necessary to have a fresh request token from the service.

```ts
/**
 * authDidRequestToken {String} - signed JWT request token from the service
 * options {Object} (optional) - key value object with additional options
 * options.maxTokenValidInMs {Number} (optional) - maximum token validity period in milliseconds(12 hours by default)
 */
const responseToken = await affinidiDidAuthService.createDidAuthResponseToken(authDidRequestToken, options)
```

A Response token (JWT) should be used to authenticate the user at the service side. 

As a best practice, it is recommended to use the `LocalExpiringDidAuthResponseToken` utility class that can encapsulate a `responseToken`.
And keep track of its expiry time according to the local time of the client. This is needed in case the local time of the client can diverge from the service time.

```ts
/**
 * tokenRequestTime {Number} - token request time, recommended to use Date.now(), could be created before calling `createDidAuthRequestToken` method
 * responseToken {String} - response token (JWT) built on the client side
 */
const auth = LocalExpiringDidAuthResponseToken.initialize(tokenRequestTime, responseToken)
// Check if token is expired.
auth.isExpiredAt(Date.now())
```
#### Validating of the response token(service side)

It is recommended to implement the `Authorization` header for every endpoint and expect to receive the response token from the client side.
Each time given response token might be validated by the service using the `verifyDidAuthResponseToken` method

```ts
/**
 * responseToken {String} - response token (JWT) built on the client side.
 * environment {Stirng} (required) - environment, could be `dev`, `staging` or `prod`
 * accessApiKey {Stirng} (required) - client access api key(uuid) 
 */
const isValid = await affinidiDidAuthService.verifyDidAuthResponseToken(responseToken, {
  environment: environment,
  accessApiKey: accessApiKey,
})
```

[Generate accessApiKey](https://github.com/affinityproject/affinidi-core-sdk/tree/master/sdk/core#create-api-key).
If the response token is not valid service should throw an error, otherwise, the request should proceed.

### Implementation of the *service* side part of `DID Auth` flow using `DidAuthServerService` class

`DidAuthServerService` is introduced for implementation of the `DID-Auth` flow on the *service* side.
The benefit of using `DidAuthServerService` is - it provides only two methods that might be in use for the *service*:
 - to create a request token to challenge the client App (`createDidAuthRequestToken`)
 - to validate the response token during the authentication process (`verifyDidAuthResponseToken`).

This class could be useful if you would like to implement your own `did-auth service` as an additional layer at `api-gateway`.

Example:
```ts
import { DidAuthServerService, Signer } from '@affinidi/affinidi-did-auth-lib'
import { KeysService, DidDocumentService, LocalKeyVault } from '@affinidi/common'
import { parse } from 'did-resolver'

// `serviceEncryptedSeed` and `serviceEncryptionKey` should be taken from the wallet.
const keyService = new KeysService(serviceEncryptedSeed, serviceEncryptionKey)
const documentService = DidDocumentService.createDidDocumentService(keyService)
// Initialize `Signer` class instance.
const signer = new Signer({
  did: documentService.getMyDid(),
  keyId: documentService.getKeyId(),
  keyVault: new LocalKeyVault(keyService),
})
// Parsing the service DID.
const verifierDid = parse(documentService.getMyDid()).did
// Initialize `DidAuthServerService` class.
const serverService = new DidAuthServerService(verifierDid, signer, null)
// Parsing the client DID (might come inside the client request as e.g. `audienceLongDid`).
const audienceDid = parse(audienceLongDid).did
const authDidRequestToken = await serverService.createDidAuthRequestToken(audienceDid, expiresAt)
```

### Using `DidAuthClientService` class to implement the *client* side part of `DID Auth` flow 

`DidAuthClientService` is introduced for implementation of `DID-Auth` flow on the *client* side.
This class provides only `createDidAuthResponseToken`(create response token) which might be used only with `LocalExpiringDidAuthResponseToken` to prevent time inconsistent issues between service and client.
It could be used as an alternative to the `AffinidiDidAuthService` class.

Example:
```ts
import { LocalExpiringDidAuthResponseToken, DidAuthClientService, Signer } from '@affinidi/affinidi-did-auth-lib'
import { KeysService, DidDocumentService, LocalKeyVault } from '@affinidi/common'

// `clientEncryptedSeed` and `clientEncryptionKey` should be taken from the wallet.
const keyService = new KeysService(clientEncryptedSeed, clientEncryptionKey)
const documentService = DidDocumentService.createDidDocumentService(keyService)
// Initialize `Signer` class instance.
const signer = new Signer({
  did: documentService.getMyDid(),
  keyId: documentService.getKeyId(),
  keyVault: new LocalKeyVault(keyService),
})
// Initialize `DidAuthClientService` class instance.
const didAuthClientService = new DidAuthClientService(signer)

let auth: LocalExpiringDidAuthResponseToken
// Example of the method that could be implemented to prepare a response token
// to authenticate clients on the service side using the `Did-Auth` flow.
const getAuth = async (maxTokenValidInMs: number): Promise<LocalExpiringDidAuthResponseToken> => {
  // Check if the token exists and if the token is expired.
  if (auth && !auth.isExpiredAt(Date.now())) {
    return auth
  }
  // Setting token request time.
  const tokenRequestTime = Date.now()
  // Example of method that pulls request token from the service side.
  const requestToken = await pullDidAuthRequestToken({})
  const responseToken = await didAuthClientService.createDidAuthResponseToken(requestToken, { maxTokenValidInMs })
  
  auth = LocalExpiringDidAuthResponseToken.initialize(tokenRequestTime, responseToken)
  
  return auth
}
```

## Testing

For unit tests we are using Mocha and Chai.

```bash
npm run test
```

