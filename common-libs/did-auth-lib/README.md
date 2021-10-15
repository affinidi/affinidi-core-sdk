# Affinidi Did Auth Helpers (PUBLIC)

## Usage:
[Flow diagram](https://swimlanes.io/u/GolxCmVL0)

```
import DidAuthService from '@affinidi/affinidi-did-auth-lib'

const options = { encryptedSeed: '...', encryptionKey: '...' }
const didAuthService = new DidAuthService(options)

// At the Server side (should recieve client did and generate for it didAuthRequest)
const didAuthRequest = await didAuthService.createDidAuthRequestToken(audienceDid, expiresAt?)

// At the Client got didAuthRequest from server:
const auth = await didAuthService.createDidAuthResponseToken(didAuthRequest, expiresAt?)

// Client send this auth for Server to any endpoint which required it
// Initial Check at the Server side

const verifyOptions = { environment: 'dev', accessApiKey: '...' }

const isVErifierd = await verifyDidAuthResponseToken(auth, verifyOptions)
```

[Generate accessApiKey](https://apikey.affinidi.com/)

To generate didAuthResponse at the client side with cloud-wallet:
```

const didAuthService = new DidAuthService({ encryptedSeed: '', encryptionKey: '' })
const environment = 'dev' | 'staging' | 'prod'
const auth = await didAuthService.createDidAuthResponseTokenThroughCloudWallet(didAuthRequest, accessApiKey, cloudWalletAccessToken, environment)
```

## Testing

For unit tests we are using Mocha and Chai.

```bash
npm run test
```

