/* eslint-disable */
export default {
  "components": {
    "examples": {},
    "headers": {},
    "parameters": {},
    "requestBodies": {},
    "responses": {},
    "schemas": {
      "ValidateJwtOutput": {
        "properties": {
          "isValid": {
            "type": "boolean"
          },
          "payload": {
            "anyOf": [
              {
                "properties": {
                  "exp": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "number",
                        "format": "double"
                      }
                    ]
                  },
                  "iat": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "number",
                        "format": "double"
                      }
                    ]
                  },
                  "jti": {
                    "type": "string"
                  },
                  "iss": {
                    "type": "string"
                  }
                },
                "additionalProperties": {},
                "type": "object"
              },
              {
                "type": "string"
              }
            ]
          }
        },
        "required": [
          "isValid",
          "payload"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ValidateJwtInput": {
        "properties": {
          "token": {
            "type": "string"
          }
        },
        "required": [
          "token"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "FreeFormObject": {
        "properties": {},
        "type": "object",
        "additionalProperties": {}
      },
      "SignedCredential": {
        "$ref": "#/components/schemas/FreeFormObject"
      },
      "VerifyCredentialShareResponseOutput": {
        "properties": {
          "jti": {
            "type": "string"
          },
          "errors": {
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "issuer": {
            "type": "string"
          },
          "isValid": {
            "type": "boolean"
          },
          "suppliedCredentials": {
            "items": {
              "$ref": "#/components/schemas/SignedCredential"
            },
            "type": "array"
          }
        },
        "required": [
          "jti",
          "errors",
          "issuer",
          "isValid",
          "suppliedCredentials"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "VerifyCredentialShareResponseInput": {
        "properties": {
          "credentialShareRequestToken": {
            "type": "string",
            "nullable": true
          },
          "credentialShareResponseToken": {
            "type": "string"
          },
          "isHolderMustBeSubject": {
            "type": "boolean",
            "nullable": true
          }
        },
        "required": [
          "credentialShareResponseToken"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "VerifyCredentialOutput": {
        "properties": {
          "errors": {
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "isValid": {
            "type": "boolean"
          }
        },
        "required": [
          "errors",
          "isValid"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "W3cCredentialStatus": {
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "revocationListIndex": {
            "type": "string"
          },
          "revocationListCredential": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "type",
          "revocationListIndex",
          "revocationListCredential"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "W3cProof": {
        "properties": {
          "type": {
            "type": "string",
            "nullable": true
          },
          "created": {
            "type": "string",
            "nullable": true
          },
          "verificationMethod": {
            "type": "string"
          },
          "proofPurpose": {
            "type": "string"
          },
          "jws": {
            "type": "string",
            "nullable": true
          },
          "proofValue": {
            "type": "string",
            "nullable": true
          },
          "nonce": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "verificationMethod",
          "proofPurpose"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "W3cCredential": {
        "properties": {
          "@context": {
            "anyOf": [
              {
                "$ref": "#/components/schemas/FreeFormObject"
              },
              {
                "type": "string"
              }
            ]
          },
          "id": {
            "type": "string",
            "nullable": true
          },
          "type": {
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "holder": {
            "anyOf": [
              {
                "$ref": "#/components/schemas/FreeFormObject"
              },
              {
                "type": "string"
              }
            ],
            "nullable": true
          },
          "credentialSubject": {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          "credentialStatus": {
            "allOf": [
              {
                "$ref": "#/components/schemas/W3cCredentialStatus"
              }
            ],
            "nullable": true
          },
          "issuanceDate": {
            "type": "string"
          },
          "issuer": {
            "type": "string"
          },
          "expirationDate": {
            "type": "string",
            "nullable": true
          },
          "proof": {
            "$ref": "#/components/schemas/W3cProof"
          },
          "credentialSchema": {
            "properties": {
              "type": {
                "type": "string"
              },
              "id": {
                "type": "string"
              }
            },
            "required": [
              "type",
              "id"
            ],
            "type": "object"
          }
        },
        "required": [
          "@context",
          "type",
          "credentialSubject",
          "issuanceDate",
          "issuer",
          "proof"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "VerifyCredentialInput": {
        "properties": {
          "verifiableCredentials": {
            "items": {
              "$ref": "#/components/schemas/W3cCredential"
            },
            "type": "array",
            "minItems": 1
          },
          "issuerDidDocument": {
            "$ref": "#/components/schemas/FreeFormObject"
          }
        },
        "required": [
          "verifiableCredentials"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "VerifyPresentationOutput": {
        "properties": {
          "error": {
            "type": "string"
          },
          "errors": {
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "isValid": {
            "type": "boolean"
          }
        },
        "required": [
          "isValid"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "W3cPresentation": {
        "properties": {
          "@context": {
            "anyOf": [
              {
                "$ref": "#/components/schemas/FreeFormObject"
              },
              {
                "type": "string"
              }
            ]
          },
          "id": {
            "type": "string",
            "nullable": true
          },
          "type": {
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "holder": {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          "verifiableCredential": {
            "items": {
              "$ref": "#/components/schemas/W3cCredential"
            },
            "type": "array"
          },
          "proof": {
            "$ref": "#/components/schemas/FreeFormObject"
          }
        },
        "required": [
          "@context",
          "type",
          "holder",
          "verifiableCredential",
          "proof"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "VerifyPresentationInput": {
        "properties": {
          "verifiablePresentation": {
            "$ref": "#/components/schemas/W3cPresentation"
          },
          "signedPresentation": {
            "$ref": "#/components/schemas/W3cPresentation"
          },
          "challenge": {
            "type": "string"
          }
        },
        "type": "object",
        "additionalProperties": false
      },
      "BuildCredentialRequestOutput": {
        "properties": {
          "credentialShareRequest": {
            "$ref": "#/components/schemas/FreeFormObject"
          }
        },
        "required": [
          "credentialShareRequest"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "UrlType": {
        "type": "string",
        "pattern": "^https?:\\/\\/.*$"
      },
      "CredentialRequirements": {
        "properties": {
          "type": {
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "constraints": {
            "anyOf": [
              {
                "items": {
                  "type": "string"
                },
                "type": "array"
              },
              {
                "items": {
                  "$ref": "#/components/schemas/FreeFormObject"
                },
                "type": "array"
              }
            ]
          }
        },
        "required": [
          "type"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "DidType": {
        "type": "string",
        "pattern": "did:.*"
      },
      "DateISOType": {
        "type": "string",
        "pattern": "\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)"
      },
      "BuildCredentialRequestInput": {
        "properties": {
          "callbackUrl": {
            "allOf": [
              {
                "$ref": "#/components/schemas/UrlType"
              }
            ],
            "nullable": true
          },
          "credentialRequirements": {
            "items": {
              "$ref": "#/components/schemas/CredentialRequirements"
            },
            "type": "array"
          },
          "issuerDid": {
            "allOf": [
              {
                "$ref": "#/components/schemas/DidType"
              }
            ],
            "nullable": true
          },
          "subjectDid": {
            "allOf": [
              {
                "$ref": "#/components/schemas/DidType"
              }
            ],
            "nullable": true
          },
          "audienceDid": {
            "allOf": [
              {
                "$ref": "#/components/schemas/DidType"
              }
            ],
            "nullable": true
          },
          "expiresAt": {
            "allOf": [
              {
                "$ref": "#/components/schemas/DateISOType"
              }
            ],
            "nullable": true
          },
          "nonce": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "credentialRequirements"
        ],
        "type": "object",
        "additionalProperties": false
      }
    },
    "securitySchemes": {}
  },
  "info": {
    "title": "affinity-verifier",
    "version": "0.34.1",
    "description": "Affinity verifier",
    "license": {
      "name": "ISC"
    },
    "contact": {
      "name": "The Engineering Team",
      "email": "nucleus.team@affinidi.com"
    }
  },
  "openapi": "3.0.0",
  "paths": {
    "/verifier/validate-jwt": {
      "post": {
        "operationId": "ValidateJwt",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidateJwtOutput"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "description": "Validates JWT object.\n\nreturns\n  isValid: boolean\n  payload: payload from JWT",
        "tags": [
          "Verifier"
        ],
        "security": [],
        "parameters": [
          {
            "in": "header",
            "name": "Api-Key",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ValidateJwtInput"
              }
            }
          }
        }
      }
    },
    "/verifier/verify-share-response": {
      "post": {
        "operationId": "VerifyCredentialShareResponse",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyCredentialShareResponseOutput"
                }
              }
            }
          }
        },
        "description": "Verifying JWT token (signature and expiration), validate each credential\ninside it (signature), validate response against request if requestToken was passed.\n\n`errors` contains list of error messages for invalid credentials.",
        "summary": "Verifying share response token.",
        "tags": [
          "Verifier"
        ],
        "security": [],
        "parameters": [
          {
            "in": "header",
            "name": "Api-Key",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifyCredentialShareResponseInput"
              }
            }
          }
        }
      }
    },
    "/verifier/verify-vcs": {
      "post": {
        "operationId": "VerifyCredentials",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyCredentialOutput"
                }
              }
            }
          }
        },
        "description": "Verifying Verifiable Credentials (signatures)\n\n`isValid` - true if all credentials verified\n`errors` contains list of error messages for invalid credentials.",
        "summary": "Verifying VC",
        "tags": [
          "Verifier"
        ],
        "security": [],
        "parameters": [
          {
            "in": "header",
            "name": "Api-Key",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifyCredentialInput"
              }
            }
          }
        }
      }
    },
    "/verifier/verify-vp": {
      "post": {
        "operationId": "VerifyPresentation",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyPresentationOutput"
                }
              }
            }
          }
        },
        "description": "Verifying Verifiable Presentation (signatures)\nThe request body has three optional fields:\n- verifiablePresentation - VP with structure according to W3C\n- signedPresentation - signed VP with structure according to W3C\n- challenge - VP challenge, which the VP requester could optionally send\n  to check if it is the same as in VP. Otherwise, the check will be skipped.\n\nNOTE 1: You must use `verifiablePresentation` or `signedPresentation` as a request body input field.\n\nNOTE 2: VP challenge (according to VP model docs) could be any string. Endpoint allows only JWT challenge created\nusing `generatePresentationChallenge` of `@affinidi/wallet-core-sdk`. In that case, JWT will be processed correctly\nand will provide more security out of the box.\n\n`isValid` - true if presentation verified\n`error` verificaction error.",
        "summary": "Verifying VP",
        "tags": [
          "Verifier"
        ],
        "security": [],
        "parameters": [
          {
            "in": "header",
            "name": "Api-Key",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifyPresentationInput"
              }
            }
          }
        }
      }
    },
    "/verifier/build-credential-request": {
      "post": {
        "operationId": "BuildCredentialRequest",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BuildCredentialRequestOutput"
                }
              }
            }
          }
        },
        "description": "Build credential share request JWT object from input data.",
        "summary": "Builds credential share request.",
        "tags": [
          "Verifier"
        ],
        "security": [],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BuildCredentialRequestInput"
              }
            }
          }
        }
      }
    }
  },
  "servers": [
    {
      "url": "/api/v1"
    }
  ]
} as const
