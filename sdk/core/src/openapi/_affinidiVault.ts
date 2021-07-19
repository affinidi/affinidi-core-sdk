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
            "EncryptedVc": {
                "properties": {
                    "createdAt": {
                        "type": "string",
                        "format": "date-time"
                    },
                    "payload": {
                        "type": "string"
                    },
                    "credentialTypes": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "credentialId": {
                        "type": "string"
                    }
                },
                "required": [
                    "createdAt",
                    "payload",
                    "credentialTypes",
                    "credentialId"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "SearchEncryptedVcOutput": {
                "properties": {
                    "credentials": {
                        "items": {
                            "$ref": "#/components/schemas/EncryptedVc"
                        },
                        "type": "array"
                    }
                },
                "required": [
                    "credentials"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "EncryptedVcOutput": {
                "properties": {
                    "createdAt": {
                        "type": "string",
                        "format": "date-time"
                    },
                    "payload": {
                        "type": "string"
                    },
                    "credentialTypes": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "credentialId": {
                        "type": "string"
                    }
                },
                "required": [
                    "createdAt",
                    "payload",
                    "credentialTypes",
                    "credentialId"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "StoreEncryptedVcInput": {
                "properties": {
                    "payload": {
                        "type": "string"
                    },
                    "credentialTypes": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    }
                },
                "required": [
                    "payload",
                    "credentialTypes"
                ],
                "type": "object",
                "additionalProperties": false
            }
        },
        "securitySchemes": {}
    },
    "info": {
        "title": "@affinidi/vault",
        "version": "0.1.0",
        "description": "Affinidi Verifiable Credential Vault",
        "license": {
            "name": "ISC"
        },
        "contact": {
            "name": "Yiğitcan UÇUM ",
            "email": "yigitcan.u@affinidi.com"
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
        "/credentials": {
            "get": {
                "operationId": "SearchCredentials",
                "responses": {
                    "200": {
                        "description": "Ok",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/SearchEncryptedVcOutput"
                                }
                            }
                        }
                    }
                },
                "tags": [
                    "Credential"
                ],
                "security": [
                    {
                        "bearerAuth": []
                    }
                ],
                "parameters": [
                    {
                        "in": "query",
                        "name": "types",
                        "required": false,
                        "schema": {
                            "type": "string"
                        },
                        "examples": {
                            "Example 1": {
                                "value": "[[\"type-1\", \"type-2\"], [\"type-3\"]]"
                            },
                            "Example 2": {
                                "value": "[[]]"
                            },
                            "Example 3": {
                                "value": ""
                            }
                        }
                    }
                ]
            }
        },
        "/credentials/{id}": {
            "get": {
                "operationId": "GetCredential",
                "responses": {
                    "200": {
                        "description": "Ok",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/EncryptedVcOutput"
                                }
                            }
                        }
                    }
                },
                "tags": [
                    "Credential"
                ],
                "security": [
                    {
                        "bearerAuth": []
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
            "put": {
                "operationId": "StoreCredential",
                "responses": {
                    "200": {
                        "description": "Ok",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/EncryptedVcOutput"
                                }
                            }
                        }
                    }
                },
                "tags": [
                    "Credential"
                ],
                "security": [
                    {
                        "bearerAuth": []
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
                                "$ref": "#/components/schemas/StoreEncryptedVcInput"
                            }
                        }
                    }
                }
            },
            "delete": {
                "operationId": "DeleteCredential",
                "responses": {
                    "204": {
                        "content": {
							"application/json": {}
						},
                        "description": "No content"
                    }
                },
                "tags": [
                    "Credential"
                ],
                "security": [
                    {
                        "bearerAuth": []
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
        }
    },
    "servers": [
        {
            "url": "/api/v1"
        }
    ]
} as const