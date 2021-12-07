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
			"BloomDidVerification": {
				"properties": {
					"did": {
						"type": "string"
					},
					"accessToken": {
						"type": "string"
					},
					"tokenSignature": {
						"type": "string"
					}
				},
				"required": [
					"did",
					"accessToken",
					"tokenSignature"
				],
				"type": "object",
				"additionalProperties": false
			},
			"MigrationCredential": {
				"properties": {
					"bloomVaultIndex": {
						"type": "number",
						"format": "double"
					},
					"id": {
						"type": "string"
					},
					"types": {
						"items": {
							"type": "string"
						},
						"type": "array"
					},
					"payload": {
						"type": "string"
					}
				},
				"required": [
					"bloomVaultIndex",
					"id",
					"types",
					"payload"
				],
				"type": "object",
				"additionalProperties": false
			},
			"MigrateCredentialsInput": {
				"properties": {
					"bloomOptions": {
						"$ref": "#/components/schemas/BloomDidVerification"
					},
					"verifiableCredentials": {
						"items": {
							"$ref": "#/components/schemas/MigrationCredential"
						},
						"type": "array"
					}
				},
				"required": [
					"bloomOptions",
					"verifiableCredentials"
				],
				"type": "object",
				"additionalProperties": false
			},
			"RequestTokenDto": {
				"properties": {
					"token": {
						"type": "string"
					}
				},
				"required": [
					"token"
				],
				"type": "object"
			},
			"ValidateTokenDto": {
				"properties": {
					"expiresAt": {
						"type": "number",
						"format": "double"
					}
				},
				"required": [
					"expiresAt"
				],
				"type": "object"
			},
			"ValidateTokenInput": {
				"properties": {
					"did": {
						"type": "string"
					},
					"signature": {
						"type": "string"
					},
					"accessToken": {
						"type": "string"
					}
				},
				"required": [
					"did",
					"signature",
					"accessToken"
				],
				"type": "object"
			},
			"GetCredentialsDto": {
				"properties": {
					"cyphertext": {
						"type": "string"
					},
					"id": {
						"type": "number",
						"format": "double"
					}
				},
				"required": [
					"cyphertext",
					"id"
				],
				"type": "object"
			},
			"DeleteCredentialsDto": {
				"properties": {
					"deletedCount": {
						"type": "number",
						"format": "double"
					},
					"dataCount": {
						"type": "number",
						"format": "double"
					}
				},
				"required": [
					"deletedCount",
					"dataCount"
				],
				"type": "object"
			},
			"SaveCredentialsDto": {
				"properties": {
					"id": {
						"type": "number",
						"format": "double"
					}
				},
				"required": [
					"id"
				],
				"type": "object"
			},
			"SaveCredentialsInput": {
				"properties": {
					"cyphertext": {
						"type": "string"
					},
					"id": {
						"type": "number",
						"format": "double"
					}
				},
				"required": [
					"cyphertext"
				],
				"type": "object"
			}
		},
		"securitySchemes": {}
	},
	"info": {
		"title": "vault-migration-service",
		"version": "1.0.0",
		"description": "Temporary service to proceed migration flow of credentials from Bloom Vault to Affinidi Vault",
		"license": {
			"name": "ISC"
		},
		"contact": {
			"name": "Yurii Skrypnyk yurii.s@affinidi.com"
		}
	},
	"openapi": "3.0.0",
	"paths": {
		"/did-auth/create-did-auth-request": {
			"post": {
				"operationId": "CreateDidAuthRequest",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"type": "string"
								}
							}
						}
					}
				},
				"tags": [
					"DidAuthentication"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"required": true,
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
		"/migration/started": {
			"get": {
				"operationId": "MigrationStarted",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"type": "boolean"
								}
							}
						}
					}
				},
				"tags": [
					"Migration"
				],
				"security": [],
				"parameters": []
			}
		},
		"/migration/done/{bloomDid}": {
			"get": {
				"operationId": "MigrationDone",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"type": "boolean"
								}
							}
						}
					}
				},
				"tags": [
					"Migration"
				],
				"security": [
					{
						"bearerAuth": []
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
						"in": "path",
						"name": "bloomDid",
						"required": true,
						"schema": {
							"type": "string"
						}
					}
				]
			}
		},
		"/migration/credentials": {
			"post": {
				"operationId": "MigrateCredentials",
				"responses": {
					"204": {
						"description": "No content"
					}
				},
				"tags": [
					"Migration"
				],
				"security": [
					{
						"bearerAuth": []
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
				],
				"requestBody": {
					"required": true,
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/MigrateCredentialsInput"
							}
						}
					}
				}
			}
		},
		"/auth/request-token": {
			"post": {
				"operationId": "RequestToken",
				"responses": {
					"200": {
						"description": "OK",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/RequestTokenDto"
								}
							}
						}
					}
				},
				"tags": [
					"BloomAuth"
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
					},
					{
						"in": "query",
						"name": "did",
						"required": true,
						"schema": {
							"type": "string"
						}
					}
				]
			}
		},
		"/auth/validate-token": {
			"post": {
				"operationId": "ValidateToken",
				"responses": {
					"200": {
						"description": "OK",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ValidateTokenDto"
								}
							}
						}
					}
				},
				"tags": [
					"BloomAuth"
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
								"$ref": "#/components/schemas/ValidateTokenInput"
							}
						}
					}
				}
			}
		},
		"/data/{start}/{end}": {
			"get": {
				"operationId": "GetCredentials",
				"responses": {
					"200": {
						"description": "OK",
						"content": {
							"application/json": {
								"schema": {
									"items": {
										"$ref": "#/components/schemas/GetCredentialsDto"
									},
									"type": "array"
								}
							}
						}
					}
				},
				"tags": [
					"BloomData"
				],
				"security": [],
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
					},
					{
						"in": "path",
						"name": "start",
						"required": true,
						"schema": {
							"format": "double",
							"type": "number"
						}
					},
					{
						"in": "path",
						"name": "end",
						"required": true,
						"schema": {
							"format": "double",
							"type": "number"
						}
					}
				]
			},
			"delete": {
				"operationId": "DeleteCredentials",
				"responses": {
					"200": {
						"description": "OK",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/DeleteCredentialsDto"
								}
							}
						}
					}
				},
				"tags": [
					"BloomData"
				],
				"security": [],
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
					},
					{
						"in": "path",
						"name": "start",
						"required": true,
						"schema": {
							"format": "double",
							"type": "number"
						}
					},
					{
						"in": "path",
						"name": "end",
						"required": true,
						"schema": {
							"format": "double",
							"type": "number"
						}
					}
				]
			}
		},
		"/data": {
			"post": {
				"operationId": "SaveCredential",
				"responses": {
					"200": {
						"description": "OK",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/SaveCredentialsDto"
								}
							}
						}
					}
				},
				"tags": [
					"BloomData"
				],
				"security": [],
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
				],
				"requestBody": {
					"required": true,
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/SaveCredentialsInput"
							}
						}
					}
				}
			}
		}
	},
	"servers": [
		{
			"url": "/"
		}
	]
} as const
