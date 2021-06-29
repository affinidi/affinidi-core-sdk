/* eslint-disable */
// Fake swagger documentation for bloom vault, created manually,
// because actual documentation is not available for it
export default {
	"components": {
		"schemas": {
			"Blob": {
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
				"type": "object",
				"additionalProperties": false
			},
			"RequestAuthTokenOutput": {
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
			"ValidateAuthTokenInput": {
				"properties": {
					"accessToken": {
						"type": "string"
					},
					"signature": {
						"type": "string"
					},
					"did": {
						"type": "string"
					}
				},
				"required": [
					"accessToken",
					"signature",
					"did"
				],
				"type": "object",
				"additionalProperties": false
			},
			"PostCredentialInput": {
				"properties": {
					"cyphertext": {
						"type": "string"
					}
				},
				"required": [
					"cyphertext"
				],
				"type": "object",
				"additionalProperties": false
			},
		}
	},
	"paths": {
		"/auth/request-token": {
			"post": {
				"operationId": "RequestAuthToken",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/RequestAuthTokenOutput"
								}
							}
						}
					}
				},
			}
		},
		"/auth/validate-token": {
			"post": {
				"operationId": "ValidateAuthToken",
				"responses": {
					"204": {
						"content": {
							"application/json": {}
						}
					}
				},
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ValidateAuthTokenInput"
							}
						}
					}
				}
			}
		},
		"/data": {
			"post": {
				"operationId": "PostCredential",
				"responses": {
					"204": {
						"content": {
							"application/json": {}
						}
					}
				},
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/PostCredentialInput"
							}
						}
					}
				}
			},
			"delete": {
				"operationId": "DeleteCredentials",
				"responses": {
					"204": {
						"content": {
							"application/json": {}
						}
					}
				},
			},
			"get": {
				"operationId": "GetCredentials",
				"responses": {
					"200": {
						"content": {
							"application/json": {
								"schema": {
									"items": {
										"$ref": "#/components/schemas/Blob"
									},
									"type": "array"
								}
							}
						}
					}
				},
			}
		}
	},
	"servers": [
		{
			"url": ""
		}
	]
} as const
