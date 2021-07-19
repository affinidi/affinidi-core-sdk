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
        "required": ["nonce", "signatureValue", "creator"],
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
        "required": ["@context", "issuer", "issued", "type", "expires", "claim", "proof"],
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
        "required": ["jti", "errors", "issuer", "isValid", "suppliedCredentials"],
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
        "required": ["credentialShareResponseToken"],
        "type": "object",
        "additionalProperties": false
      },
      "BuildCredentialRequestOutput": {
        "properties": {
          "credentialShareRequest": {
            "$ref": "#/components/schemas/FreeFormObject"
          }
        },
        "required": ["credentialShareRequest"],
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
        "required": ["type"],
        "type": "object",
        "additionalProperties": false
      },
      "BuildCredentialRequestInput": {
        "properties": {
          "callbackUrl": {
            "type": "string",
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
            "nullable": true
          },
          "subjectDid": {
            "type": "string",
            "nullable": true
          }
        },
        "required": ["credentialRequirements"],
        "type": "object",
        "additionalProperties": false
      }
    },
    "securitySchemes": {}
  },
  "info": {
    "title": "affinity-verifier",
    "version": "0.0.2",
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
        "tags": ["Verifier"],
        "security": [],
        "parameters": [],
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
        "tags": ["Verifier"],
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
