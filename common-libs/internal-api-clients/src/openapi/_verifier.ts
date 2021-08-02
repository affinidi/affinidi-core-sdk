/* eslint-disable */
export default {
  "components": {
    "examples": {},
    "headers": {},
    "parameters": {},
    "requestBodies": {},
    "responses": {},
    "schemas": {
      "FreeFormObject": {
        "properties": {},
        "type": "object",
        "additionalProperties": {
          "additionalProperties": true,
          "type": "object"
        }
      },
      "Proof": {
        "properties": {
          "created": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "type": {
            "type": "string",
            "nullable": true
          },
          "nonce": {
            "type": "string"
          },
          "signatureValue": {
            "type": "string"
          },
          "creator": {
            "type": "string"
          }
        },
        "required": [
          "nonce",
          "signatureValue",
          "creator"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "SignedCredential": {
        "properties": {
          "@context": {
            "items": {
              "$ref": "#/components/schemas/FreeFormObject"
            },
            "type": "array"
          },
          "id": {
            "type": "string",
            "nullable": true
          },
          "name": {
            "type": "string",
            "nullable": true
          },
          "issuer": {
            "type": "string"
          },
          "issued": {
            "type": "string",
            "format": "date-time"
          },
          "type": {
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "expires": {
            "type": "string",
            "format": "date-time"
          },
          "claim": {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          "proof": {
            "$ref": "#/components/schemas/Proof"
          }
        },
        "required": [
          "@context",
          "issuer",
          "issued",
          "type",
          "expires",
          "claim",
          "proof"
        ],
        "type": "object",
        "additionalProperties": false
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
            "$ref": "#/components/schemas/FreeFormObject"
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
            "oneOf": [
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
            "$ref": "#/components/schemas/W3cCredentialStatus",
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
          "isValid": {
            "type": "boolean"
          }
        },
        "required": [
          "error",
          "isValid"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "W3cPresentation": {
        "properties": {
          "@context": {
            "$ref": "#/components/schemas/FreeFormObject"
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
          }
        },
        "required": [
          "verifiablePresentation"
        ],
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
      "CredentialRequirements": {
        "properties": {
          "type": {
            "items": {
              "type": "string"
            },
            "type": "array"
          }
        },
        "required": [
          "type"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "BuildCredentialRequestInput": {
        "properties": {
          "callbackUrl": {
            "type": "string",
            "pattern": "^https?:\\/\\/.*$",
            "nullable": true
          },
          "credentialRequirements": {
            "items": {
              "$ref": "#/components/schemas/CredentialRequirements"
            },
            "type": "array"
          },
          "issuerDid": {
            "type": "string",
            "pattern": "did:(elem|jolo):.*",
            "nullable": true
          },
          "subjectDid": {
            "type": "string",
            "pattern": "did:(elem|jolo):.*",
            "nullable": true
          },
          "audienceDid": {
            "type": "string",
            "pattern": "did:(elem|jolo):.*",
            "nullable": true
          },
          "expiresAt": {
            "type": "string",
            "pattern": "\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)",
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
    "version": "0.0.82",
    "description": "Affinity verifier",
    "license": {
      "name": "ISC"
    }
  },
  "openapi": "3.0.0",
  "paths": {
    "/verifier/verify-share-response": {
      "post": {
        "operationId": "VerifyCredentialShareResponse",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyCredentialShareResponseOutput"
                }
              }
            },
            "description": "Ok"
          }
        },
        "description": "Verifying JWT token (signature and expiration), validate each credential inside it (signature), validate response against request if requestToken was passed.\n\n`errors` contains list of error messages for invalid credentials.",
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
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyCredentialOutput"
                }
              }
            },
            "description": "Ok"
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
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyPresentationOutput"
                }
              }
            },
            "description": "Ok"
          }
        },
        "description": "Verifying Verifiable Presentation (signatures)\n\n`isValid` - true if presentation verified\n`error` verificaction error.",
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
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BuildCredentialRequestOutput"
                }
              }
            },
            "description": "Ok"
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
