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
        "additionalProperties": {}
      },
      "ContextType": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          {
            "items": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "$ref": "#/components/schemas/FreeFormObject"
                }
              ]
            },
            "type": "array"
          }
        ]
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
      "UnsignedW3cCredential": {
        "properties": {
          "@context": {
            "$ref": "#/components/schemas/ContextType"
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
            "allOf": [
              {
                "$ref": "#/components/schemas/FreeFormObject"
              }
            ],
            "nullable": true
          },
          "credentialSubject": {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          "issuanceDate": {
            "type": "string",
            "nullable": true
          },
          "credentialStatus": {
            "allOf": [
              {
                "$ref": "#/components/schemas/W3cCredentialStatus"
              }
            ],
            "nullable": true
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
          "credentialSubject"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "StoredW3cCredential": {
        "$ref": "#/components/schemas/UnsignedW3cCredential"
      },
      "StoredOpenAttestationDocumentSignature": {
        "properties": {
          "type": {
            "type": "string"
          },
          "targetHash": {
            "type": "string"
          },
          "proof": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "$ref": "#/components/schemas/FreeFormObject"
              },
              {
                "items": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "$ref": "#/components/schemas/FreeFormObject"
                    }
                  ]
                },
                "type": "array"
              }
            ]
          },
          "merkleRoot": {
            "type": "string"
          }
        },
        "type": "object",
        "additionalProperties": false
      },
      "StoredOpenAttestationDocument": {
        "properties": {
          "version": {
            "type": "string"
          },
          "data": {
            "anyOf": [
              {
                "$ref": "#/components/schemas/FreeFormObject"
              },
              {
                "type": "string"
              }
            ]
          },
          "signature": {
            "$ref": "#/components/schemas/StoredOpenAttestationDocumentSignature"
          }
        },
        "required": [
          "version",
          "data"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "StoredCredential": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/StoredW3cCredential"
          },
          {
            "$ref": "#/components/schemas/StoredOpenAttestationDocument"
          }
        ]
      },
      "GetCredentialsOutput": {
        "items": {
          "$ref": "#/components/schemas/StoredCredential"
        },
        "type": "array"
      },
      "GetCredentialOutput": {
        "$ref": "#/components/schemas/StoredCredential"
      },
      "ShareCredentialOutput": {
        "properties": {
          "qrCode": {
            "type": "string"
          },
          "sharingUrl": {
            "type": "string"
          }
        },
        "required": [
          "qrCode",
          "sharingUrl"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ValidateTTL": {
        "type": "string",
        "pattern": "^[0-9]+(h|d){0,1}$"
      },
      "ShareCredentialInput": {
        "properties": {
          "ttl": {
            "allOf": [
              {
                "$ref": "#/components/schemas/ValidateTTL"
              }
            ],
            "nullable": true
          }
        },
        "type": "object",
        "additionalProperties": false
      },
      "SaveCredentialOutput": {
        "properties": {
          "credentialIds": {
            "items": {
              "type": "string"
            },
            "type": "array"
          }
        },
        "required": [
          "credentialIds"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "SaveCredentialInput": {
        "properties": {
          "data": {
            "items": {
              "allOf": [
                {
                  "$ref": "#/components/schemas/StoredCredential"
                },
                {
                  "$ref": "#/components/schemas/FreeFormObject"
                }
              ]
            },
            "type": "array"
          }
        },
        "required": [
          "data"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "W3cProof": {
        "allOf": [
          {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          {
            "properties": {
              "type": {
                "type": "string"
              }
            },
            "required": [
              "type"
            ],
            "type": "object"
          }
        ]
      },
      "W3cCredential": {
        "properties": {
          "@context": {
            "$ref": "#/components/schemas/ContextType"
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
          "issuer": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "$ref": "#/components/schemas/FreeFormObject"
              }
            ]
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
          "id",
          "type",
          "holder",
          "credentialSubject",
          "issuanceDate",
          "issuer",
          "proof"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "SignCredentialOutput": {
        "properties": {
          "signedCredential": {
            "$ref": "#/components/schemas/W3cCredential"
          }
        },
        "required": [
          "signedCredential"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "KeyTypes": {
        "type": "string",
        "enum": [
          "rsa",
          "bbs"
        ]
      },
      "SignCredentialInput": {
        "properties": {
          "unsignedCredential": {
            "$ref": "#/components/schemas/UnsignedW3cCredential"
          },
          "keyType": {
            "$ref": "#/components/schemas/KeyTypes"
          }
        },
        "required": [
          "unsignedCredential"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "W3cPresentation": {
        "properties": {
          "@context": {
            "$ref": "#/components/schemas/ContextType"
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
      "SignPresentationOutput": {
        "properties": {
          "signedPresentation": {
            "$ref": "#/components/schemas/W3cPresentation"
          }
        },
        "required": [
          "signedPresentation"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "UnsignedW3cPresentation": {
        "properties": {
          "@context": {
            "$ref": "#/components/schemas/ContextType"
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
          }
        },
        "required": [
          "@context",
          "type",
          "holder",
          "verifiableCredential"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "SignPresentationInput": {
        "properties": {
          "unsignedPresentation": {
            "$ref": "#/components/schemas/UnsignedW3cPresentation"
          },
          "challenge": {
            "type": "string"
          },
          "domain": {
            "type": "string"
          }
        },
        "required": [
          "unsignedPresentation",
          "challenge",
          "domain"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "CredentialRequirement": {
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
      "GenerateCredentialShareRequestTokenRequest": {
        "properties": {
          "requirements": {
            "items": {
              "$ref": "#/components/schemas/CredentialRequirement"
            },
            "type": "array"
          },
          "issuerDid": {
            "type": "string"
          },
          "audienceDid": {
            "type": "string"
          },
          "expiresAt": {
            "type": "string"
          },
          "nonce": {
            "type": "string"
          },
          "callbackUrl": {
            "type": "string"
          }
        },
        "required": [
          "requirements"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "CreateCredentialShareResponseTokenRequest": {
        "properties": {
          "credentialShareRequestToken": {
            "type": "string"
          },
          "credentials": {
            "items": {
              "$ref": "#/components/schemas/W3cCredential"
            },
            "type": "array"
          }
        },
        "required": [
          "credentialShareRequestToken",
          "credentials"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "LoginOutput": {
        "properties": {
          "accessToken": {
            "type": "string"
          },
          "did": {
            "type": "string"
          }
        },
        "required": [
          "accessToken",
          "did"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ValidatedUsername": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128
      },
      "ExistingPassword": {
        "type": "string",
        "minLength": 1
      },
      "LoginInput": {
        "properties": {
          "username": {
            "$ref": "#/components/schemas/ValidatedUsername"
          },
          "password": {
            "$ref": "#/components/schemas/ExistingPassword"
          }
        },
        "required": [
          "username",
          "password"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "SignUpOutput": {
        "properties": {
          "accessToken": {
            "type": "string"
          },
          "did": {
            "type": "string"
          }
        },
        "required": [
          "accessToken",
          "did"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ValidatedPassword": {
        "type": "string",
        "minLength": 8,
        "maxLength": 256,
        "pattern": "^[\\S]+.*[\\S]+$"
      },
      "DidMethod": {
        "type": "string",
        "enum": [
          "jolo",
          "elem"
        ]
      },
      "SdkOptionsInput": {
        "properties": {
          "didMethod": {
            "allOf": [
              {
                "$ref": "#/components/schemas/DidMethod"
              }
            ],
            "nullable": true
          },
          "keyTypes": {
            "items": {
              "$ref": "#/components/schemas/KeyTypes"
            },
            "type": "array",
            "minLength": 1
          }
        },
        "type": "object",
        "additionalProperties": false
      },
      "MessageParameters": {
        "properties": {
          "message": {
            "type": "string"
          },
          "subject": {
            "type": "string"
          },
          "htmlMessage": {
            "type": "string"
          }
        },
        "required": [
          "message"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "SignUpInput": {
        "properties": {
          "username": {
            "$ref": "#/components/schemas/ValidatedUsername"
          },
          "password": {
            "$ref": "#/components/schemas/ValidatedPassword"
          },
          "options": {
            "allOf": [
              {
                "$ref": "#/components/schemas/SdkOptionsInput"
              }
            ],
            "nullable": true
          },
          "messageParameters": {
            "allOf": [
              {
                "$ref": "#/components/schemas/MessageParameters"
              }
            ],
            "nullable": true
          }
        },
        "required": [
          "username",
          "password"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ConfirmSignUpOutput": {
        "properties": {
          "accessToken": {
            "type": "string"
          },
          "did": {
            "type": "string"
          }
        },
        "required": [
          "accessToken",
          "did"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ConfirmSignUpInput": {
        "properties": {
          "token": {
            "type": "string",
            "minLength": 1
          },
          "confirmationCode": {
            "type": "string",
            "minLength": 1
          },
          "options": {
            "allOf": [
              {
                "$ref": "#/components/schemas/SdkOptionsInput"
              }
            ],
            "nullable": true
          }
        },
        "required": [
          "token",
          "confirmationCode"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ForgotPasswordInput": {
        "properties": {
          "username": {
            "$ref": "#/components/schemas/ValidatedUsername"
          }
        },
        "required": [
          "username"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ForgotPasswordConfirmInput": {
        "properties": {
          "username": {
            "$ref": "#/components/schemas/ValidatedUsername"
          },
          "otp": {
            "type": "string",
            "minLength": 1
          },
          "newPassword": {
            "$ref": "#/components/schemas/ValidatedPassword"
          }
        },
        "required": [
          "username",
          "otp",
          "newPassword"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ChangeUsernameInput": {
        "properties": {
          "username": {
            "$ref": "#/components/schemas/ValidatedUsername"
          }
        },
        "required": [
          "username"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ChangeUsernameConfirmInput": {
        "properties": {
          "username": {
            "$ref": "#/components/schemas/ValidatedUsername"
          },
          "confirmationCode": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "username",
          "confirmationCode"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ChangePasswordInput": {
        "properties": {
          "oldPassword": {
            "$ref": "#/components/schemas/ExistingPassword"
          },
          "newPassword": {
            "$ref": "#/components/schemas/ValidatedPassword"
          }
        },
        "required": [
          "oldPassword",
          "newPassword"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "SignInInput": {
        "properties": {
          "username": {
            "$ref": "#/components/schemas/ValidatedUsername"
          },
          "messageParameters": {
            "allOf": [
              {
                "$ref": "#/components/schemas/MessageParameters"
              }
            ],
            "nullable": true
          }
        },
        "required": [
          "username"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ConfirmSignInOutput": {
        "properties": {
          "accessToken": {
            "type": "string"
          },
          "did": {
            "type": "string"
          }
        },
        "required": [
          "accessToken",
          "did"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ConfirmSignInInput": {
        "properties": {
          "token": {
            "type": "string",
            "minLength": 1
          },
          "confirmationCode": {
            "type": "string",
            "minLength": 1
          },
          "issueSignupCredential": {
            "type": "boolean",
            "nullable": true
          }
        },
        "required": [
          "token",
          "confirmationCode"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "PasswordlessLoginInput": {
        "properties": {
          "username": {
            "$ref": "#/components/schemas/ValidatedUsername"
          },
          "messageParameters": {
            "allOf": [
              {
                "$ref": "#/components/schemas/MessageParameters"
              }
            ],
            "nullable": true
          }
        },
        "required": [
          "username"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ConfirmPasswordlessLoginOutput": {
        "properties": {
          "accessToken": {
            "type": "string"
          },
          "did": {
            "type": "string"
          }
        },
        "required": [
          "accessToken",
          "did"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ConfirmPasswordlessLoginInput": {
        "properties": {
          "token": {
            "type": "string",
            "minLength": 1
          },
          "confirmationCode": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "token",
          "confirmationCode"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "SignedJwtObject": {
        "properties": {
          "header": {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          "payload": {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          "signature": {
            "type": "string"
          }
        },
        "required": [
          "header",
          "payload"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "SignJwtOutput": {
        "properties": {
          "jwtObject": {
            "$ref": "#/components/schemas/SignedJwtObject"
          }
        },
        "required": [
          "jwtObject"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "UnsignedJwtObject": {
        "properties": {
          "header": {
            "$ref": "#/components/schemas/FreeFormObject"
          },
          "payload": {
            "$ref": "#/components/schemas/FreeFormObject"
          }
        },
        "required": [
          "header",
          "payload"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "SignJwtInput": {
        "properties": {
          "jwtObject": {
            "$ref": "#/components/schemas/UnsignedJwtObject"
          }
        },
        "required": [
          "jwtObject"
        ],
        "type": "object",
        "additionalProperties": false
      }
    },
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  },
  "info": {
    "title": "cloud-wallet-api",
    "version": "0.7.8",
    "description": "Affinidi SSIaaS",
    "license": {
      "name": "ISC"
    },
    "contact": {
      "name": "Roman Brazhnyk"
    }
  },
  "openapi": "3.0.0",
  "paths": {
    "/wallet/credentials": {
      "get": {
        "operationId": "GetCredentials",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetCredentialsOutput"
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
        "description": "Get user's credentials.",
        "tags": [
          "Wallet"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "credentialShareRequestToken",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ]
      },
      "post": {
        "operationId": "StoreCredentials",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SaveCredentialOutput"
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
        "description": "Save credentials\n\nExpected `data` to be an array of VCs to save.\nVC type can be W3C credential or Open Attestation Document\n\n```\nOpenAttestationDocument {\n  version: string\n  data: FreeFormObject\n  signature: {\n    type: string\n    targetHash: string\n    proof: FreeFormObject[]\n    merkleRoot: string\n  }\n}\n```\n\n```\nW3cCredential {\n  '@context': FreeFormObject\n  id: string\n  type: string[]\n  holder: FreeFormObject\n  credentialSubject: FreeFormObject\n  issuanceDate: string\n  issuer: string\n  expirationDate?: string\n  proof: {\n    type?: string\n    created?: string\n    verificationMethod: string\n    proofPurpose: string\n    jws: string\n  }\n}\n```",
        "tags": [
          "Wallet"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SaveCredentialInput"
              }
            }
          }
        }
      }
    },
    "/wallet/credentials/{id}": {
      "get": {
        "operationId": "GetCredential",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetCredentialOutput"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "404": {
            "description": "Credential not found"
          }
        },
        "description": "Get user's credential by credentialId.",
        "tags": [
          "Wallet"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ]
      },
      "delete": {
        "operationId": "DeleteCredential",
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "404": {
            "description": "Credential not found"
          }
        },
        "description": "Delete user's credential by credentialId.",
        "tags": [
          "Wallet"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ]
      }
    },
    "/wallet/credentials/{id}/share": {
      "post": {
        "operationId": "ShareCredential",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ShareCredentialOutput"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "404": {
            "description": "Credential not found"
          }
        },
        "description": "Share user's credential by credentialId.\n\nParams:\n\n  `ttl` (optional) - string, in hours, that defines credential's\nexpiration time after which it should be removed.\n\nFor example: 96\n\nBy default TTL is `96 hours`. If `0` is passed, shared credential\nwill be expired in 100 years.\n\nReturns raw QR and its image in base64 format.",
        "tags": [
          "Wallet"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "id",
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
                "$ref": "#/components/schemas/ShareCredentialInput"
              }
            }
          }
        }
      }
    },
    "/wallet/sign-credential": {
      "post": {
        "operationId": "SignCredential",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SignCredentialOutput"
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
        "description": "Sign credential.",
        "tags": [
          "Wallet"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SignCredentialInput"
              }
            }
          }
        }
      }
    },
    "/wallet/sign-presentation": {
      "post": {
        "operationId": "SignPresentation",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SignPresentationOutput"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "description": "Sign verifiable presentation.\n\nA VP can be targeted to a specific verifier by using a Linked Data Proof\nthat includes a domain and challenge. This also helps prevent a verifier\nfrom reusing a VP as their own.\n\nParams:\n\n  `unsignedPresentation` of UnsignedW3cPresentation type\n\n  `domain` - can be any string or URI\n\n  `challenge` - should be a randomly generated string\n\nReturns signed verifiable presentation",
        "tags": [
          "Wallet"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SignPresentationInput"
              }
            }
          }
        }
      }
    },
    "/wallet/credential-share-token/generate-request-token": {
      "post": {
        "operationId": "GenerateCredentialShareRequestToken",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
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
        "description": "Create JWT of credential share request\n\nA VP can be targeted to a specific verifier by using a Linked Data Proof\nthat includes a domain and challenge. This also helps prevent a verifier\nfrom reusing a VP as their own.\n\nParams:\n\n  `credentialRequirements` - array of credential requirements with credential types\n\n  `issuerDid` (optional) - DID of the issuer\n\n  `audienceDid` (optional) - audience of generated token\n\n  `expiresAt` (optional) - expire date-time of generated token\n\n  `nonce` (optional) - nonce/jti of generated token\n\n  `callbackUrl` (optional)\n\nReturns JWT with credential share request",
        "tags": [
          "Wallet"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/GenerateCredentialShareRequestTokenRequest"
              }
            }
          }
        }
      }
    },
    "/wallet/credential-share-token/create-response-token": {
      "post": {
        "operationId": "CreateCredentialShareResponseToken",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
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
        "description": "Create JWT of credential share response\n\nParams:\n\n  `credentialShareRequestToken` - JWT with the requested VCs\n\n  `credentials` - array of signed credentials\n\nReturns JWT with credential share response",
        "tags": [
          "Wallet"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateCredentialShareResponseTokenRequest"
              }
            }
          }
        }
      }
    },
    "/share/{hash}": {
      "get": {
        "operationId": "RetrieveSharedCredential",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {}
              }
            }
          },
          "404": {
            "description": "Shared credential not found."
          }
        },
        "description": "Retrieve shared credential by hash.",
        "tags": [
          "Share"
        ],
        "security": [],
        "parameters": [
          {
            "in": "path",
            "name": "hash",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "key",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ]
      }
    },
    "/users/get-did": {
      "get": {
        "operationId": "GetDid",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          },
          "404": {
            "description": "User not found"
          }
        },
        "description": "Return DID of existing user.",
        "tags": [
          "User"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [
          {
            "in": "header",
            "name": "Api-Key",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "header",
            "name": "Authorization",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ]
      }
    },
    "/users/login": {
      "post": {
        "operationId": "Login",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginOutput"
                }
              }
            }
          },
          "400": {
            "description": "Incorrect username or password"
          },
          "404": {
            "description": "User not found"
          }
        },
        "description": "Login an existing user into the network.\n\nAs an `username` **arbitrary username** OR **email** OR **phone number** can be used.\n\nValid username examples:\n- great_user\n- great_user@gmail.com\n- +1234567890",
        "tags": [
          "User"
        ],
        "security": [
          {
            "apiKey": []
          }
        ],
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
                "$ref": "#/components/schemas/LoginInput"
              }
            }
          }
        }
      }
    },
    "/users/signup": {
      "post": {
        "operationId": "SignUp",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "anyOf": [
                    {
                      "$ref": "#/components/schemas/SignUpOutput"
                    },
                    {
                      "type": "string"
                    }
                  ]
                }
              }
            }
          },
          "400": {
            "description": "Bad request"
          },
          "409": {
            "description": "User with the given username already exists"
          }
        },
        "description": "Signs up a new user.\n\nAs an `username` **arbitrary username** OR **email** OR **phone number** can be used.\n\nReturns an object with a `token` for the **confirmSignUp** endpoint OR\nan an object with an `accessToken` and `did` IF **arbitrary username** was provided.",
        "tags": [
          "User"
        ],
        "security": [
          {
            "apiKey": []
          }
        ],
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
                "$ref": "#/components/schemas/SignUpInput"
              }
            }
          }
        }
      }
    },
    "/users/signup/confirm": {
      "post": {
        "operationId": "ConfirmSignUp",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ConfirmSignUpOutput"
                }
              }
            }
          },
          "400": {
            "description": "Confirmation code is invalid"
          },
          "404": {
            "description": "User not found"
          }
        },
        "description": "Confirms sign up of a new user into the network.",
        "tags": [
          "User"
        ],
        "security": [
          {
            "apiKey": []
          }
        ],
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
                "$ref": "#/components/schemas/ConfirmSignUpInput"
              }
            }
          }
        }
      }
    },
    "/users/logout": {
      "post": {
        "operationId": "Logout",
        "responses": {
          "204": {
            "description": "No Content"
          },
          "400": {
            "description": "Bad Request"
          }
        },
        "description": "Signs out user from all devices. It also invalidates all refresh tokens\nissued to a user. The user's current access and Id tokens remain valid\nuntil their expiry. Access and Id tokens expire one hour after they are\nissued.",
        "tags": [
          "User"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [
          {
            "in": "header",
            "name": "Authorization",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "header",
            "name": "Api-Key",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ]
      }
    },
    "/users/forgot-password": {
      "post": {
        "operationId": "ForgotPassword",
        "responses": {
          "204": {
            "description": "No Content"
          },
          "400": {
            "description": "Username should be valid email or phone number"
          },
          "404": {
            "description": "User not found"
          }
        },
        "description": "Resets password for the user.",
        "tags": [
          "User"
        ],
        "security": [
          {
            "apiKey": []
          }
        ],
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
                "$ref": "#/components/schemas/ForgotPasswordInput"
              }
            }
          }
        }
      }
    },
    "/users/forgot-password/confirm": {
      "post": {
        "operationId": "ForgotPasswordConfirm",
        "responses": {
          "204": {
            "description": "No Content"
          },
          "400": {
            "description": "Confirmation code is invalid"
          },
          "404": {
            "description": "User not found"
          }
        },
        "description": "Resets password for the user.",
        "tags": [
          "User"
        ],
        "security": [
          {
            "apiKey": []
          }
        ],
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
                "$ref": "#/components/schemas/ForgotPasswordConfirmInput"
              }
            }
          }
        }
      }
    },
    "/users/change-username": {
      "post": {
        "operationId": "ChangeUsername",
        "responses": {
          "204": {
            "description": "No Content"
          },
          "404": {
            "description": "User not found"
          },
          "409": {
            "description": "User with the given username already exists"
          }
        },
        "description": "Sets/updates login username.\n\nAs an `username` **email** OR **phone number** can be used.",
        "tags": [
          "User"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [
          {
            "in": "header",
            "name": "Api-Key",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "header",
            "name": "Authorization",
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
                "$ref": "#/components/schemas/ChangeUsernameInput"
              }
            }
          }
        }
      }
    },
    "/users/change-username/confirm": {
      "post": {
        "operationId": "ChangeUsernameConfirm",
        "responses": {
          "204": {
            "description": "No Content"
          },
          "400": {
            "description": "Confirmation code is invalid"
          }
        },
        "description": "Confirms changing username with providing OTP.",
        "tags": [
          "User"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [
          {
            "in": "header",
            "name": "Api-Key",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "header",
            "name": "Authorization",
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
                "$ref": "#/components/schemas/ChangeUsernameConfirmInput"
              }
            }
          }
        }
      }
    },
    "/users/change-password": {
      "post": {
        "operationId": "ChangePassword",
        "responses": {
          "204": {
            "description": "No Content"
          },
          "400": {
            "description": "Bad request"
          }
        },
        "description": "Updates user's password",
        "tags": [
          "User"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [
          {
            "in": "header",
            "name": "Api-Key",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "header",
            "name": "Authorization",
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
                "$ref": "#/components/schemas/ChangePasswordInput"
              }
            }
          }
        }
      }
    },
    "/users/sign-in-passwordless": {
      "post": {
        "operationId": "SignIn",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          }
        },
        "description": "Passwordless sign in - makes login if user exists or sign up otherwise.\nMay not work if user used another username / email / phone number during registration\n\nAs an `username` **email** OR **phone number** can be used.\n\nReturns an object with a `token` for the **confirmSignIn** endpoint.",
        "tags": [
          "User"
        ],
        "security": [
          {
            "apiKey": []
          }
        ],
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
                "$ref": "#/components/schemas/SignInInput"
              }
            }
          }
        }
      }
    },
    "/users/sign-in-passwordless/confirm": {
      "post": {
        "operationId": "ConfirmSignIn",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ConfirmSignInOutput"
                }
              }
            }
          },
          "400": {
            "description": "Confirmation code is invalid"
          }
        },
        "description": "Confirms passwordless sign in to the network.\n\nParams:\n\n  token - received from the **signIn** endpoint\n\n  confirmationCode - OTP code\n\nReturns an object with accessToken and DID",
        "tags": [
          "User"
        ],
        "security": [
          {
            "apiKey": []
          }
        ],
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
                "$ref": "#/components/schemas/ConfirmSignInInput"
              }
            }
          }
        }
      }
    },
    "/users/log-in-passwordless": {
      "post": {
        "operationId": "LogIn",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          }
        },
        "description": "Passwordless log in - for cases when user exists already\n\nAs an `username` **email** OR **phone number** can be used.\n\nReturns an object with a `token` for the **confirmSignIn** endpoint.",
        "tags": [
          "User"
        ],
        "security": [
          {
            "apiKey": []
          }
        ],
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
                "$ref": "#/components/schemas/PasswordlessLoginInput"
              }
            }
          }
        }
      }
    },
    "/users/log-in-passwordless/confirm": {
      "post": {
        "operationId": "ConfirmLogIn",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ConfirmPasswordlessLoginOutput"
                }
              }
            }
          },
          "400": {
            "description": "Confirmation code is invalid"
          }
        },
        "description": "Confirms passwordless log in to the network.\n\nParams:\n\n  token - received from the **logIn** endpoint\n\n  confirmationCode - OTP code\n\nReturns an object with accessToken and DID",
        "tags": [
          "User"
        ],
        "security": [
          {
            "apiKey": []
          }
        ],
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
                "$ref": "#/components/schemas/ConfirmPasswordlessLoginInput"
              }
            }
          }
        }
      }
    },
    "/utilities/sign-jwt": {
      "post": {
        "operationId": "SignJwt",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SignJwtOutput"
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
        "description": "Sign JWT object.",
        "tags": [
          "Utilities"
        ],
        "security": [
          {
            "bearerAuth": [],
            "apiKey": []
          }
        ],
        "parameters": [
          {
            "in": "header",
            "name": "Api-Key",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "header",
            "name": "Authorization",
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
                "$ref": "#/components/schemas/SignJwtInput"
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