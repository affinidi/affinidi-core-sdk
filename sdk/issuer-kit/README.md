# Introduction

Issuer Kit is a library that spins up a VC producing server based on configurations defined by the Application. The Application defines a few key functions required to build the VC, including any helpers or external connections required to collect and validate the data prior to issuance.

Issuer Kit defines an extensible protocol for VC issuance, regardless of the source of the data. The flow can handle anything from primary issuers, where the application already has the data, to a multi-step process that connects with external data providers and solicits asynchronous input from end users.


## Key Concepts

The core functionality is expressed through the importable "issuer" function. 

```ts
issuer<VCSPhonePerson, IEndpointSpec>({
  endpoints, // Specification functions (initiate, verify)
  expirationLength: 60 * 60 * 24 * 365.25, // One year expiration for VCs
  fastifyOpts: {logger: {level: 'debug'}}, // Options to pass to fastify()
  fastifyListenOpts: {port: 3000}, // Options to pass to fastify.listen()
  swaggerOpts: { // Options to pass to fastify-swagger
    exposeRoute: true,
    swagger: {
      info: {
        title: 'Issuer Phone Twilio API',
        description: 'Issue a Phone VC based on an SMS challenge',
        version: '1.0.0',
      },
    },
  },
})

```


### Endpoints - Initiate

The initiate function creates a new incomplete VC.  Information may be provided that is used to set off the validation of the information to be described by the VC - e.g., a phone number or email address to be validated.


### Endpoints - Verify

The verify function is the final function called in the VC issuance process (except for signing). It accepts all final arguments used to establish proof or validity of data prior to issuing the VC. In the phone/ email VC example, this would contain the challenge token sent the end user to prove control of the contact information. The verify function must implement the data transformation from source data to standardized `credentialSubject` using network-level accepted schemas.

The verify function must also perform any database or other cleanup upon completion (optional later extension, periodic cleanup jobs.


### Endpoints - isReady (optional)

In some cases, there is a variable amount of time after `Initiate` is called until the data provider is ready to participate in the issuance process. `isReady` is polled to check the status with the data provider. It can return simple or complex status report.

### Authentication

Issuer Kit uses [Fastify Hooks](https://github.com/fastify/fastify/blob/master/docs/Hooks.md) to listen to specific events in the request/response lifecycle. The `preParsing` hook can be used to add authentication to the endpoints. Developers pass hooks in the `routeOpts` field of each endpoint and Fastify adds them when the route is registered by Issuer Kit.


### OpenAPI Configuration

Issuer Kit uses [Fastify-Swagger](https://github.com/fastify/fastify-swagger) to automatically generate OpenAPI docs for each Issuer Service. If `exposeRoute` is set to `true` in the `swaggerOpts` on the Issuer function, documentation is served at `baseUrl/documentation`. Documentation is generated for each route using `routeOpts.schema`.

![Swagger Demo](assets/OpenAPI.png)

## Issuer Signatures

Issuer Service returns a fully formed, but **unsigned** Verifiable Credential to the Issuer. The final step of VC issuance is to sign the VC with the Issuer's private key. It is recommended to use the Affinity Wallet SDK (TODO link) for this final signature.

## Additional Requirements

Developers are responsible for defining the structure of their Issuer Service, including:

* Persistent storage
* Secret management for API keys
* Deploy scripts

## Reference Implementation

Affinity maintains a reference implementation Issuer Service based on the Issuer Kit. Developers are encouraged to clone this service and use it as a framework for developing their own.

This service issues VCs that verify if a person controls a specified phone number. The service uses an external API to send a challenge token to an end user, and if the user responds successfully, the service issues a VC of type `VCPhonePerson`. The details of this service are outlined in [Integration Guide](integration-guide.md)
