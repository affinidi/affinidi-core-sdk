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
			"Env": {
				"type": "string",
				"enum": [
					"dev",
					"staging",
					"prod"
				]
			},
			"FreeFormObjectResponse": {
				"properties": {},
				"type": "object",
				"additionalProperties": {}
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
			"TsoaSdkOptions": {
				"properties": {
					"apiKey": {
						"type": "string",
						"nullable": true
					},
					"accessApiKey": {
						"type": "string",
						"nullable": true
					},
					"env": {
						"allOf": [
							{
								"$ref": "#/components/schemas/Env"
							}
						],
						"nullable": true
					},
					"issuerUrl": {
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
						"allOf": [
							{
								"$ref": "#/components/schemas/TsoaSdkOptions"
							}
						],
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
		"version": "1.11.1",
		"description": "Backend for Affinity SaaS Wallet",
		"license": {
			"name": "ISC"
		},
		"contact": {
			"name": "Denis Popov ",
			"email": "denis.p@affinity-project.org"
		}
	},
	"openapi": "3.0.0",
	"paths": {
		"/message-templates/storeTemplate": {
			"post": {
				"operationId": "StoreTemplate",
				"responses": {
					"204": {
						"description": "No content"
					}
				},
				"tags": [
					"MessageTemplate"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"required": true,
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
						"description": "No content"
					}
				},
				"tags": [
					"MessageTemplate"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"required": true,
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
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/GetCredentialOfferOutput"
								}
							}
						}
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
							"$ref": "#/components/schemas/Env"
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
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/GetSignedCredentialOutput"
								}
							}
						}
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
					"required": true,
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
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/KeyOutput"
								}
							}
						}
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
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/KeyOutput"
								}
							}
						}
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
					"required": true,
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
						"description": "No content"
					}
				},
				"tags": [
					"UserManagement"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"required": true,
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
						"description": "No content"
					}
				},
				"tags": [
					"UserManagement"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"required": true,
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/AdminDeleteUnconfirmedUserInput"
							}
						}
					}
				}
			}
		},
		"/userManagement/adminDeleteIncompleteUser": {
			"post": {
				"operationId": "AdminDeleteIncompleteUser",
				"responses": {
					"204": {
						"description": "No content"
					}
				},
				"description": "This endpoint should be used as a fallback in case user creation hangs,\nand it should delete the user from cognito, to allow retries.",
				"tags": [
					"UserManagement"
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
		}
	},
	"servers": [
		{
			"url": "/api/v1"
		}
	]
} as const
