/* eslint-disable */
export default {
	"components": {
		"examples": {},
		"headers": {},
		"parameters": {},
		"requestBodies": {},
		"responses": {},
		"schemas": {
			"DidAuthRequestTokenInput": {
				"properties": {
					"audienceDid": {
						"type": "string"
					}
				},
				"required": [
					"audienceDid"
				],
				"type": "object",
				"additionalProperties": false
			},
			"RevocationListCredentialSubject": {
				"properties": {
					"id": {
						"type": "string"
					},
					"type": {
						"type": "string"
					},
					"encodedList": {
						"type": "string"
					}
				},
				"required": [
					"id",
					"type",
					"encodedList"
				],
				"type": "object",
				"additionalProperties": false
			},
			"Proof": {
				"properties": {
					"type": {
						"type": "string"
					},
					"created": {
						"type": "string",
						"nullable": true
					},
					"proofPurpose": {
						"type": "string"
					},
					"verificationMethod": {
						"type": "string"
					},
					"jws": {
						"type": "string"
					}
				},
				"required": [
					"type",
					"proofPurpose",
					"verificationMethod",
					"jws"
				],
				"type": "object",
				"additionalProperties": false
			},
			"Credential": {
				"properties": {
					"id": {
						"type": "string"
					},
					"@context": {
						"items": {
							"type": "string"
						},
						"type": "array"
					},
					"type": {
						"items": {
							"type": "string"
						},
						"type": "array"
					},
					"issuer": {
						"type": "string"
					},
					"issuanceDate": {
						"type": "string"
					},
					"credentialSubject": {
						"$ref": "#/components/schemas/RevocationListCredentialSubject"
					},
					"proof": {
						"$ref": "#/components/schemas/Proof"
					}
				},
				"required": [
					"id",
					"@context",
					"type",
					"issuer",
					"issuanceDate",
					"credentialSubject",
					"proof"
				],
				"type": "object",
				"additionalProperties": false
			},
			"CredentialStatus": {
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
			"RevocationListOutput": {
				"properties": {
					"credentialStatus": {
						"$ref": "#/components/schemas/CredentialStatus"
					},
					"revocationListCredential": {
						"additionalProperties": true,
						"type": "object"
					}
				},
				"required": [
					"credentialStatus",
					"revocationListCredential"
				],
				"type": "object",
				"additionalProperties": false
			},
			"RevocationListInput": {
				"properties": {
					"credentialId": {
						"type": "string"
					},
					"subjectDid": {
						"type": "string"
					}
				},
				"required": [
					"credentialId",
					"subjectDid"
				],
				"type": "object",
				"additionalProperties": false
			},
			"RevokeCredentialOutput": {
				"properties": {
					"revocationListCredential": {
						"type": "string"
					}
				},
				"required": [
					"revocationListCredential"
				],
				"type": "object",
				"additionalProperties": false
			},
			"RevokeCredentialInput": {
				"properties": {
					"id": {
						"type": "string"
					},
					"revocationReason": {
						"type": "string",
						"nullable": true
					}
				},
				"required": [
					"id"
				],
				"type": "object",
				"additionalProperties": false
			}
		},
		"securitySchemes": {}
	},
	"info": {
		"title": "@affinidi/revocation-api",
		"version": "0.0.1",
		"description": "Affinity Revocation API",
		"license": {
			"name": "ISC"
		}
	},
	"openapi": "3.0.0",
	"paths": {
		"/did-auth/create-did-auth-request": {
			"post": {
				"operationId": "CreateDidAuthRequest",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"type": "string"
								}
							}
						},
						"description": "Ok"
					}
				},
				"tags": [
					"DidAuthentication"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/DidAuthRequestTokenInput"
							}
						}
					}
				}
			}
		},
		"/revocation/revocation-list-2020-credentials/{issuerDid}/{id}": {
			"get": {
				"operationId": "GetRevocationListCredential",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/Credential"
								}
							}
						},
						"description": "Ok"
					}
				},
				"description": "Get revocation list 2020 Credential (required to check if VC revoked).",
				"summary": "Return revocation list credential.",
				"tags": [
					"Revocation"
				],
				"security": [],
				"parameters": [
					{
						"in": "path",
						"name": "issuerDid",
						"required": true,
						"schema": {
							"type": "string"
						}
					},
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
		"/revocation/build-revocation-list-2020-status": {
			"post": {
				"operationId": "BuildRevocationListStatus",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/RevocationListOutput"
								}
							}
						},
						"description": "Ok"
					}
				},
				"description": "Build revocation list 2020 status (required parameters for revocable credentials).",
				"summary": "Build revocation list 2020 credential parameters.",
				"tags": [
					"Revocation"
				],
				"security": [
					{
						"bearerAuth": []
					}
				],
				"parameters": [],
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/RevocationListInput"
							}
						}
					}
				}
			}
		},
		"/revocation/revoke-credential": {
			"post": {
				"operationId": "RevokeCredential",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/RevokeCredentialOutput"
								}
							}
						},
						"description": "Ok"
					}
				},
				"description": "Update index/credetial at appropriate revocation list (set revoken is true).",
				"summary": "Revoke Credential.",
				"tags": [
					"Revocation"
				],
				"security": [
					{
						"bearerAuth": []
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
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/RevokeCredentialInput"
							}
						}
					}
				}
			}
		},
		"/revocation/publish-revocation-list-credential": {
			"post": {
				"operationId": "PublishRevocationListCredential",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/Credential"
								}
							}
						},
						"description": "Ok"
					}
				},
				"description": "Publish revocation list credential for new created or updated revocation list.",
				"summary": "Publish Revocation list credential.",
				"tags": [
					"Revocation"
				],
				"security": [
					{
						"bearerAuth": []
					}
				],
				"parameters": [],
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/Credential"
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
