const parsedCredentialShareResponseToken = {
  payload: {
    interactionToken: {
      suppliedCredentials: [
        {
          type: ['Credential', 'ProofOfNameCredential'],
          constraints: [''],
          issuer: 'did:jolo:91046856b028fb52433f6def61709b5c12ac130c450b2c7b5cb4e8c3fcf3764a#keys-1',
        },
      ],
      callbackURL: 'https://kudos-issuer-backend.affinity-project.org/receive/testerBadge',
    },
    exp: 1589535297428,
    typ: 'credentialRequest',
    jti: '70456a1c9328639a',
    iss: 'did:jolo:91046856b028fb52433f6def61709b5c12ac130c450b2c7b5cb4e8c3fcf3764a#keys-1',
  },
}

export default parsedCredentialShareResponseToken
