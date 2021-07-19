/* eslint-disable */
export default {
	"components": {
		"examples": {},
		"headers": {},
		"parameters": {},
		"requestBodies": {},
		"responses": {},
		"schemas": {
			"CreateMessageTemplateInput": {
				"properties": {
					"username": {
						"type": "string"
					},
					"template": {
						"type": "string"
					},
					"subject": {
						"type": "string",
						"nullable": true
					},
					"htmlTemplate": {
						"type": "string",
						"nullable": true
					}
				},
				"required": [
					"username",
					"template"
				],
				"type": "object",
				"additionalProperties": false
			},
			"DeleteMessageTemplateInput": {
				"properties": {
					"username": {
						"type": "string"
					}
				},
				"required": [
					"username"
				],
				"type": "object",
				"additionalProperties": false
			},
			"GetCredentialOfferOutput": {
				"properties": {
					"offerToken": {
						"type": "string"
					}
				},
				"required": [
					"offerToken"
				],
				"type": "object",
				"additionalProperties": false
			},
			"FreeFormObjectResponse": {
				"properties": {},
				"type": "object",
				"additionalProperties": {
					"additionalProperties": true,
					"type": "object"
				}
			},
			"GetSignedCredentialOutput": {
				"properties": {
					"signedCredentials": {
						"items": {
							"$ref": "#/components/schemas/FreeFormObjectResponse"
						},
						"type": "array"
					}
				},
				"required": [
					"signedCredentials"
				],
				"type": "object",
				"additionalProperties": false
			},
			"CognitoUserTokens": {
				"properties": {
					"accessToken": {
						"type": "string"
					},
					"idToken": {
						"type": "string"
					},
					"refreshToken": {
						"type": "string"
					},
					"expiresIn": {
						"type": "number",
						"format": "double"
					}
				},
				"required": [
					"accessToken",
					"idToken",
					"refreshToken",
					"expiresIn"
				],
				"type": "object",
				"additionalProperties": false
			},
			"SdkOptions": {
				"properties": {
					"registryUrl": {
						"type": "string",
						"nullable": true
					},
					"issuerUrl": {
						"type": "string",
						"nullable": true
					},
					"verifierUrl": {
						"type": "string",
						"nullable": true
					},
					"keyStorageUrl": {
						"type": "string",
						"nullable": true
					},
					"vaultUrl": {
						"type": "string",
						"nullable": true
					},
					"revocationUrl": {
						"type": "string",
						"nullable": true
					},
					"cognitoUserTokens": {
						"$ref": "#/components/schemas/CognitoUserTokens",
						"nullable": true
					},
					"didMethod": {
						"type": "string",
						"enum": [
							"jolo",
							"elem"
						],
						"nullable": true
					},
					"env": {
						"type": "string",
						"enum": [
							"dev",
							"staging",
							"prod"
						],
						"nullable": true
					},
					"phoneIssuerBasePath": {
						"type": "string",
						"nullable": true
					},
					"emailIssuerBasePath": {
						"type": "string",
						"nullable": true
					},
					"skipBackupEncryptedSeed": {
						"type": "boolean",
						"nullable": true
					},
					"skipBackupCredentials": {
						"type": "boolean",
						"nullable": true
					},
					"apiKey": {
						"type": "string",
						"nullable": true
					},
					"accessApiKey": {
						"type": "string",
						"nullable": true
					},
					"isProfilerActive": {
						"type": "boolean",
						"nullable": true
					},
					"metricsUrl": {
						"type": "string",
						"nullable": true
					},
					"storageRegion": {
						"type": "string",
						"nullable": true
					}
				},
				"type": "object",
				"additionalProperties": false
			},
			"GetSignedCredentialInput": {
				"properties": {
					"credentialOfferResponseToken": {
						"type": "string"
					},
					"options": {
						"$ref": "#/components/schemas/SdkOptions",
						"nullable": true
					}
				},
				"required": [
					"credentialOfferResponseToken"
				],
				"type": "object",
				"additionalProperties": false
			},
			"KeyOutput": {
				"properties": {
					"encryptedSeed": {
						"type": "string"
					}
				},
				"required": [
					"encryptedSeed"
				],
				"type": "object",
				"additionalProperties": false
			},
			"KeyInput": {
				"properties": {
					"encryptedSeed": {
						"type": "string"
					}
				},
				"required": [
					"encryptedSeed"
				],
				"type": "object",
				"additionalProperties": false
			},
			"AdminConfirmUserInput": {
				"properties": {
					"username": {
						"type": "string"
					}
				},
				"required": [
					"username"
				],
				"type": "object",
				"additionalProperties": false
			},
			"AdminDeleteUnconfirmedUserInput": {
				"properties": {
					"username": {
						"type": "string"
					}
				},
				"required": [
					"username"
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
		"title": "affinity-wallet-backend",
		"version": "1.0.58",
		"description": "Backend for Affinity SaaS Wallet",
		"license": {
			"name": "ISC"
		}
	},
	"openapi": "3.0.0",
	"paths": {
		"/message-templates/storeTemplate": {
			"post": {
				"operationId": "StoreTemplate",
				"responses": {
					"204": {
						"content": {
							"application/json": {}
						},
						"description": "No content"
					}
				},
				"tags": [
					"MessageTemplate"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/CreateMessageTemplateInput"
							}
						}
					}
				}
			}
		},
		"/message-templates/deleteTemplate": {
			"delete": {
				"operationId": "DeleteTemplate",
				"responses": {
					"204": {
						"content": {
							"application/json": {}
						},
						"description": "No content"
					}
				},
				"tags": [
					"MessageTemplate"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/DeleteMessageTemplateInput"
							}
						}
					}
				}
			}
		},
		"/issuer/getCredentialOffer": {
			"get": {
				"operationId": "GetCredentialOffer",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/GetCredentialOfferOutput"
								}
							}
						},
						"description": "Ok"
					}
				},
				"tags": [
					"Issuer"
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
					},
					{
						"in": "header",
						"name": "Authorization",
						"required": true,
						"schema": {
							"type": "string"
						}
					},
					{
						"in": "query",
						"name": "env",
						"required": false,
						"schema": {
							"type": "string",
							"enum": [
								"dev",
								"staging",
								"prod"
							]
						}
					}
				]
			}
		},
		"/issuer/getSignedCredential": {
			"post": {
				"operationId": "GetSignedCredential",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/GetSignedCredentialOutput"
								}
							}
						},
						"description": "Ok"
					}
				},
				"tags": [
					"Issuer"
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
					}
				],
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/GetSignedCredentialInput"
							}
						}
					}
				}
			}
		},
		"/keys/readMyKey": {
			"get": {
				"operationId": "ReadMyKey",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/KeyOutput"
								}
							}
						},
						"description": "Ok"
					}
				},
				"tags": [
					"Key"
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
					}
				]
			}
		},
		"/keys/storeMyKey": {
			"post": {
				"operationId": "StoreMyKey",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/KeyOutput"
								}
							}
						},
						"description": "Ok"
					}
				},
				"tags": [
					"Key"
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
					}
				],
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/KeyInput"
							}
						}
					}
				}
			}
		},
		"/userManagement/adminConfirmUser": {
			"post": {
				"operationId": "AdminConfirmUser",
				"responses": {
					"204": {
						"content": {
							"application/json": {}
						},
						"description": "No content"
					}
				},
				"tags": [
					"UserManagement"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/AdminConfirmUserInput"
							}
						}
					}
				}
			}
		},
		"/userManagement/adminDeleteUnconfirmedUser": {
			"post": {
				"operationId": "AdminDeleteUnconfirmedUser",
				"responses": {
					"204": {
						"content": {
							"application/json": {}
						},
						"description": "No content"
					}
				},
				"tags": [
					"UserManagement"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/AdminDeleteUnconfirmedUserInput"
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
