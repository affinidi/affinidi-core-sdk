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
				"required": [
					"accessApiKey"
				],
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
					"credentialOfferResponseToken",
					"options"
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
			"ProfileTrueCaller": {
				"properties": {
					"payload": {
						"type": "string"
					},
					"signature": {
						"type": "string"
					},
					"signatureAlgorithm": {
						"type": "string"
					},
					"avatarUrl": {
						"type": "string",
						"nullable": true
					},
					"city": {
						"type": "string",
						"nullable": true
					},
					"companyName": {
						"type": "string",
						"nullable": true
					},
					"countryCode": {
						"type": "string",
						"nullable": true
					},
					"email": {
						"type": "string",
						"nullable": true
					},
					"facebookId": {
						"type": "string",
						"nullable": true
					},
					"firstName": {
						"type": "string"
					},
					"gender": {
						"type": "string"
					},
					"isAmbassador": {
						"type": "boolean"
					},
					"isBusiness": {
						"type": "boolean"
					},
					"isVerified": {
						"type": "boolean"
					},
					"jobTitle": {
						"type": "string",
						"nullable": true
					},
					"lastName": {
						"type": "string"
					},
					"phoneNumber": {
						"type": "string"
					},
					"requestNonce": {
						"type": "string"
					},
					"street": {
						"type": "string",
						"nullable": true
					},
					"successful": {
						"type": "boolean"
					},
					"twitterId": {
						"type": "string",
						"nullable": true
					},
					"url": {
						"type": "string",
						"nullable": true
					},
					"zipcode": {
						"type": "string",
						"nullable": true
					}
				},
				"required": [
					"payload",
					"signature",
					"signatureAlgorithm"
				],
				"type": "object",
				"additionalProperties": {}
			},
			"TruecallerUserListInput": {
				"properties": {
					"profileTrueCaller": {
						"$ref": "#/components/schemas/ProfileTrueCaller"
					},
					"expiredAt": {
						"type": "string"
					},
					"env": {
						"type": "string",
						"nullable": true
					}
				},
				"required": [
					"profileTrueCaller"
				],
				"type": "object",
				"additionalProperties": false
			},
			"AdminCreateUserInput": {
				"properties": {
					"profileTrueCaller": {
						"$ref": "#/components/schemas/ProfileTrueCaller"
					},
					"password": {
						"type": "string"
					},
					"username": {
						"type": "string"
					}
				},
				"required": [
					"profileTrueCaller",
					"password",
					"username"
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
			},
			"AdminGetUserInfoOutput": {
				"properties": {
					"userCreateDate": {
						"type": "string"
					}
				},
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
		"version": "1.45.2",
		"description": "Backend for Affinity SaaS Wallet",
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
		"/message-templates/storeTemplate": {
			"post": {
				"operationId": "StoreTemplate",
				"responses": {
					"204": {
						"description": "No content"
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "Store custom message template for passwordless auth flow.",
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
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "Delete custom message template for passwordless auth flow.",
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
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "Initiate request to the issuer for provide a credential offer request token (offerToken).",
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
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "Route used by SDK for getting users email & phone number signed credentials.",
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
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "Read my encrypted key from a key storage",
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
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"409": {
						"description": "Key for this user already exists",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "Store my encrypted key on a key storage",
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
		"/truecaller/storeUserInList": {
			"post": {
				"operationId": "StoreInTruecallerUserList",
				"responses": {
					"204": {
						"description": "No content"
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "Store `Truecaller` user in DDB for further use in Cognito lambdas.",
				"tags": [
					"StoreTruecallerUserInList"
				],
				"security": [
					{
						"truecallerAuth": []
					}
				],
				"parameters": [],
				"requestBody": {
					"required": true,
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/TruecallerUserListInput"
							}
						}
					}
				}
			}
		},
		"/userManagement/adminCreateConfirmedUser": {
			"post": {
				"operationId": "AdminCreateConfirmedUser",
				"responses": {
					"204": {
						"description": "No content"
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"409": {
						"description": "User {{username}} already exists.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"422": {
						"description": "Missing configuration for AWS in environment variables.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "This endpoint should be used to create user confirmed user with a `Truecaller` profile(token).",
				"tags": [
					"UserManagement"
				],
				"security": [
					{
						"truecallerAuth": []
					}
				],
				"parameters": [],
				"requestBody": {
					"required": true,
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/AdminCreateUserInput"
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
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"404": {
						"description": "User {{username}} not found.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"409": {
						"description": "User {{username}} already confirmed.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"422": {
						"description": "Missing configuration for AWS in environment variables.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "This endpoint should be used to confirm user creation.",
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
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"404": {
						"description": "User {{username}} not found.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"409": {
						"description": "User {{username}} must be UNCONFIRMED (current status is {{userStatus}}).",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"422": {
						"description": "Missing configuration for AWS in environment variables.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "This endpoint should be used to delete unconfirmed user.",
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
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"422": {
						"description": "Missing configuration for AWS in environment variables.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
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
		},
		"/userManagement/adminLogOutUser": {
			"post": {
				"operationId": "AdminLogOutUser",
				"responses": {
					"204": {
						"description": "No content"
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"422": {
						"description": "Missing configuration for AWS in environment variables.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "Signs out a user from all devices.\nIt also invalidates all refresh tokens that Amazon Cognito has issued to a user.\nThe user's current access and ID tokens remain valid until they expire.\nBy default, access and ID tokens expire one hour after they're issued.\nA user can still use a hosted UI cookie to retrieve new tokens for the duration of the cookie validity period of 1 hour.",
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
		},
		"/userManagement/adminGetUserInfo": {
			"post": {
				"operationId": "AdminGetUserInfo",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/AdminGetUserInfoOutput"
								}
							}
						}
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"422": {
						"description": "Missing configuration for AWS in environment variables.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "This endpoint should be used to get user metadata info. Currently only userCreateDate is returned.",
				"tags": [
					"UserManagement"
				],
				"security": [
					{
						"bearerAuth": []
					}
				],
				"parameters": []
			}
		},
		"/userManagement/confirmPasswordlessSignUp": {
			"post": {
				"operationId": "ConfirmPasswordlessSignUp",
				"responses": {
					"204": {
						"description": "No content"
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"422": {
						"description": "Missing configuration for AWS in environment variables.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "This endpoint do post confirmation actions for signUp passwordless flow.",
				"tags": [
					"UserManagement"
				],
				"security": [
					{
						"bearerAuth": []
					}
				],
				"parameters": []
			}
		},
		"/userManagement/doesUserExist": {
			"get": {
				"operationId": "DoesUserExist",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"properties": {
										"isUnconfirmed": {
											"type": "boolean"
										},
										"userExists": {
											"type": "boolean"
										}
									},
									"required": [
										"isUnconfirmed",
										"userExists"
									],
									"type": "object"
								}
							}
						}
					},
					"400": {
						"description": "Bad Request",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"401": {
						"description": "Unauthorized",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"405": {
						"description": "Method Not Allowed",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					},
					"422": {
						"description": "Missing configuration for AWS in environment variables.",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/ErrorObject"
								}
							}
						}
					}
				},
				"description": "Checks if a user with a provided query exists in the system or not",
				"tags": [
					"UserManagement"
				],
				"security": [],
				"parameters": [
					{
						"in": "query",
						"name": "value",
						"required": true,
						"schema": {
							"type": "string"
						}
					},
					{
						"in": "query",
						"name": "field",
						"required": true,
						"schema": {
							"type": "string",
							"enum": [
								"username",
								"email",
								"phone_number"
							]
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
