/* eslint-disable */
export default {
	"components": {
		"examples": {},
		"headers": {},
		"parameters": {},
		"requestBodies": {},
		"responses": {},
		"schemas": {
			"ClientHelperTest": {
				"properties": {
					"clientHelperTest": {
						"type": "string"
					}
				},
				"required": [
					"clientHelperTest"
				],
				"type": "object",
				"additionalProperties": false
			}
		},
		"securitySchemes": {}
	},
	"info": {
		"title": "Spec for test",
		"version": "0.0.1",
		"description": "Spec for client helper test",
		"license": {
			"name": "ISC"
		}
	},
	"openapi": "3.0.0",
	"paths": {
		"/client-helper-test": {
			"post": {
				"operationId": "ClientHelperTest",
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
					"ClientHelperTest"
				],
				"security": [],
				"parameters": [],
				"requestBody": {
					"content": {
						"application/json": {
							"schema": {
								"$ref": "#/components/schemas/ClientHelperTest"
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
