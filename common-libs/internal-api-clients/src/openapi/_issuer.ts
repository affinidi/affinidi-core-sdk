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
      "BuildCredentialOfferOutput": {
        "properties": {
          "credentialOffer": {
            "$ref": "#/components/schemas/FreeFormObject"
          }
        },
        "required": [
          "credentialOffer"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "OfferedCredential": {
        "properties": {
          "type": {
            "type": "string"
          },
          "renderInfo": {
            "$ref": "#/components/schemas/FreeFormObject",
            "nullable": true
          }
        },
        "required": [
          "type"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "BuildCredentialOfferInput": {
        "properties": {
          "offeredCredentials": {
            "items": {
              "$ref": "#/components/schemas/OfferedCredential"
            },
            "type": "array"
          },
          "callbackUrl": {
            "type": "string",
            "nullable": true
          },
          "audienceDid": {
            "type": "string",
            "nullable": true
          },
          "expiresAt": {
            "type": "string",
            "nullable": true
          },
          "nonce": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "offeredCredentials"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "VerifyCredentialOfferResponseOutput": {
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
          "selectedCredentials": {
            "items": {
              "$ref": "#/components/schemas/OfferedCredential"
            },
            "type": "array"
          }
        },
        "required": [
          "jti",
          "errors",
          "issuer",
          "isValid",
          "selectedCredentials"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "VerifyCredentialOfferResponseInput": {
        "properties": {
          "credentialOfferResponseToken": {
            "type": "string"
          },
          "credentialOfferRequestToken": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "credentialOfferResponseToken"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "UnsignedW3cCredential": {
        "properties": {
          "@context": {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          "id": {
            "type": "string"
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
          "credentialSubject": {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          "issuanceDate": {
            "type": "string"
          },
          "expirationDate": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "@context",
          "id",
          "type",
          "holder",
          "credentialSubject",
          "issuanceDate"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "VCBuildUnsignedOutput": {
        "properties": {
          "unsignedVC": {
            "$ref": "#/components/schemas/UnsignedW3cCredential"
          },
          "unsignedCredential": {
            "$ref": "#/components/schemas/UnsignedW3cCredential"
          }
        },
        "required": [
          "unsignedVC",
          "unsignedCredential"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "VCBuildUnsignedInput": {
        "properties": {
          "type": {
            "type": "string"
          },
          "data": {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          "holderDid": {
            "type": "string",
            "pattern": "^did:(elem|jolo):.*$"
          },
          "expiresAt": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "type",
          "data",
          "holderDid"
        ],
        "type": "object",
        "additionalProperties": false
      }
    },
    "securitySchemes": {}
  },
  "info": {
    "title": "affinity-issuer",
    "version": "0.0.99",
    "description": "Affinity issuer",
    "license": {
      "name": "ISC"
    }
  },
  "openapi": "3.0.0",
  "paths": {
    "/issuer/build-credential-offer": {
      "post": {
        "operationId": "BuildCredentialOffer",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BuildCredentialOfferOutput"
                }
              }
            },
            "description": "Ok"
          }
        },
        "description": "Build credential offer JWT object from input data.",
        "summary": "Builds credential offer object.",
        "tags": [
          "Issuer"
        ],
        "security": [],
        "parameters": [],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BuildCredentialOfferInput"
              }
            }
          }
        }
      }
    },
    "/issuer/verify-offer-response": {
      "post": {
        "operationId": "VerifyCredentialOfferResponse",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VerifyCredentialOfferResponseOutput"
                }
              }
            },
            "description": "Ok"
          }
        },
        "description": "Verifying JWT token (signature and expiration), validate response against request if requestToken was passed.",
        "summary": "Verifying offer response token.",
        "tags": [
          "Issuer"
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
                "$ref": "#/components/schemas/VerifyCredentialOfferResponseInput"
              }
            }
          }
        }
      }
    },
    "/vc/build-unsigned": {
      "post": {
        "operationId": "BuildUnsigned",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/VCBuildUnsignedOutput"
                }
              }
            },
            "description": "Ok"
          }
        },
        "description": "Build unsigned VC from input data.\n`unsignedVC` response is become deprecated and will be removed at the future.\nConsumers should use `unsignedCredential` instead.",
        "summary": "Builds unsigned VC object.",
        "tags": [
          "VC"
        ],
        "security": [],
        "parameters": [],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VCBuildUnsignedInput"
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
