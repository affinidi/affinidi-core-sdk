/* eslint-disable */
export default {
    "components": {
        "examples": {},
        "headers": {},
        "parameters": {},
        "requestBodies": {},
        "responses": {},
        "schemas": {
            "ErrorObject": {
                "properties": {
                    "serviceName": {
                        "type": "string"
                    },
                    "code": {
                        "type": "string"
                    },
                    "fields": {
                        "properties": {},
                        "additionalProperties": {},
                        "type": "object"
                    },
                    "httpStatusCode": {
                        "type": "number",
                        "format": "double"
                    },
                    "message": {
                        "type": "string"
                    },
                    "context": {},
                    "originalError": {},
                    "inputParams": {},
                    "endpointUrl": {
                        "type": "string"
                    }
                },
                "required": [
                    "serviceName",
                    "code",
                    "httpStatusCode",
                    "message",
                    "inputParams",
                    "endpointUrl"
                ],
                "type": "object",
                "additionalProperties": false
            },
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
            "SendMessageOutput": {
                "properties": {
                    "id": {
                        "type": "string"
                    }
                },
                "required": [
                    "id"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "SendMessageInput": {
                "properties": {
                    "toDid": {
                        "type": "string"
                    },
                    "message": {
                        "properties": {},
                        "additionalProperties": {},
                        "type": "object"
                    }
                },
                "required": [
                    "toDid",
                    "message"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "MessageOutput": {
                "properties": {
                    "id": {
                        "type": "string"
                    },
                    "fromDid": {
                        "type": "string"
                    },
                    "toDid": {
                        "type": "string"
                    },
                    "message": {
                        "properties": {},
                        "additionalProperties": {},
                        "type": "object"
                    },
                    "createdAt": {
                        "type": "string",
                        "format": "date-time"
                    }
                },
                "required": [
                    "id",
                    "fromDid",
                    "toDid",
                    "message",
                    "createdAt"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "PullMessageOutput": {
                "properties": {
                    "messages": {
                        "items": {
                            "$ref": "#/components/schemas/MessageOutput"
                        },
                        "type": "array"
                    }
                },
                "required": [
                    "messages"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "SharedMessageOutput": {
                "properties": {
                    "url": {
                        "type": "string"
                    },
                    "qr": {
                        "type": "string"
                    },
                    "shareId": {
                        "type": "string"
                    },
                    "key": {
                        "type": "string"
                    }
                },
                "required": [
                    "url",
                    "qr",
                    "shareId",
                    "key"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "SharedMessageInput": {
                "properties": {
                    "ttlInMinutes": {
                        "type": "string"
                    },
                    "message": {},
                    "type": {
                        "type": "string"
                    }
                },
                "required": [
                    "ttlInMinutes",
                    "message",
                    "type"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "SharedMessageEntity": {
                "properties": {
                    "id": {
                        "type": "string"
                    },
                    "did": {
                        "type": "string"
                    },
                    "type": {
                        "type": "string"
                    },
                    "data": {
                        "type": "string"
                    },
                    "expiresAt": {
                        "type": "string",
                        "format": "date-time"
                    },
                    "createdAt": {
                        "type": "string",
                        "format": "date-time"
                    }
                },
                "required": [
                    "id",
                    "did",
                    "type",
                    "data",
                    "expiresAt",
                    "createdAt"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "IndexMyOutput": {
                "properties": {
                    "sharedMessages": {
                        "items": {
                            "$ref": "#/components/schemas/SharedMessageEntity"
                        },
                        "type": "array"
                    }
                },
                "required": [
                    "sharedMessages"
                ],
                "type": "object",
                "additionalProperties": false
            },
            "IndexMyInputParams": {
                "properties": {
                    "type": {
                        "type": "string"
                    }
                },
                "type": "object",
                "additionalProperties": false
            },
            "FormatEnum": {
                "type": "string",
                "enum": [
                    "json",
                    "html"
                ]
            }
        },
        "securitySchemes": {
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"
            },
            "apiKey": {
                "type": "apiKey",
                "in": "header",
                "name": "API-KEY"
            }
        }
    },
    "info": {
        "title": "affinidi-messages",
        "version": "1.22.0",
        "description": "Affinidi messages service (for async encrypted communication)",
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
        "/did-auth/create-did-auth-request": {
            "post": {
                "operationId": "CreateDidAuthRequest",
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "string"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": "string"
                                    }
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
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "serviceName": "MSG",
                                            "code": "MSG-2",
                                            "httpStatusCode": 401,
                                            "message": "You are not authorized to make this request.",
                                            "inputParams": "params",
                                            "endpointUrl": "url"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "description": "Create DID auth request token.\nThe response is a JWT signed with the service's private key.",
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
                            },
                            "example": {
                                "audienceDid": "did:elem:f559265b6c1becd56109c5623435fa797ad4308a4a686f8eda709f3387d303e2"
                            }
                        }
                    }
                }
            }
        },
        "/messages": {
            "post": {
                "operationId": "SendMessage",
                "responses": {
                    "201": {
                        "description": "OK",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/SendMessageOutput"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "id": "123e4567-e89b-12d3-a456-426614174000"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "You are not authorized to make this request.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorObject"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "serviceName": "MSG",
                                            "code": "MSG-2",
                                            "httpStatusCode": 401,
                                            "message": "You are not authorized to make this request.",
                                            "inputParams": "params",
                                            "endpointUrl": "url"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "description": "This API is used to send message to specific DID. You need to pass the DID of the receiver along with the message that you want to send.\n\nParams:\n\n  `message` - data to be stored\n\n  `toDid` - DID of the receiver\n\nReturns message id",
                "tags": [
                    "Message"
                ],
                "security": [
                    {
                        "bearerAuth": []
                    }
                ],
                "parameters": [],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/SendMessageInput"
                            },
                            "example": {
                                "toDid": "did:elem:EiCZboIQNeRaXTaZZ6aztglQbWiyyCVPQlg6cb5icxd0oQ",
                                "message": {
                                    "field1": "value1",
                                    "field2": "value2"
                                }
                            }
                        }
                    }
                }
            },
            "get": {
                "operationId": "PullMyMessages",
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/PullMessageOutput"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "messages": [
                                                {
                                                    "id": "123e4567-e89b-12d3-a456-426614174000",
                                                    "fromDid": "did:elem:EiBIGsSwUEe5hVR9yeysYY4LgW-MIz98bA6JZmaXKhxW9A",
                                                    "toDid": "did:elem:EiCZboIQNeRaXTaZZ6aztglQbWiyyCVPQlg6cb5icxd0oQ",
                                                    "message": {
                                                        "field1": "value1",
                                                        "field2": "value2"
                                                    },
                                                    "createdAt": "2022-09-20T02:15:30.000Z"
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "You are not authorized to make this request.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorObject"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "serviceName": "MSG",
                                            "code": "MSG-2",
                                            "httpStatusCode": 401,
                                            "message": "You are not authorized to make this request.",
                                            "inputParams": "params",
                                            "endpointUrl": "url"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "description": "This API is used to get the list of messages that a person has received. The owner DID is derived from auth token.",
                "tags": [
                    "Message"
                ],
                "security": [
                    {
                        "bearerAuth": []
                    }
                ],
                "parameters": []
            }
        },
        "/message/{id}": {
            "delete": {
                "operationId": "DeleteMyMessage",
                "responses": {
                    "204": {
                        "description": "OK"
                    },
                    "401": {
                        "description": "You are not authorized to make this request.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorObject"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "serviceName": "MSG",
                                            "code": "MSG-2",
                                            "httpStatusCode": 401,
                                            "message": "You are not authorized to make this request.",
                                            "inputParams": "params",
                                            "endpointUrl": "url"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Could not find message to delete",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorObject"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "serviceName": "MSG",
                                            "code": "MSG-3",
                                            "httpStatusCode": 404,
                                            "message": "Could not find message to delete",
                                            "inputParams": "params",
                                            "endpointUrl": "/message/{id}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "description": "This API is used to delete a certain message. You have to pass the message id as a parameter.",
                "tags": [
                    "Message"
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
        },
        "/sharedMessage/create-shared-message": {
            "post": {
                "operationId": "CreateSharedMessage",
                "responses": {
                    "201": {
                        "description": "OK",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/SharedMessageOutput"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "url": "https://my-host/api/v1/sharedMessage/{sharedMessage.id}?key={key}",
                                            "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAAAklEQV...",
                                            "shareId": "123e4567-e89b-12d3-a456-426614174000",
                                            "key": "encryptionKey"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "You are not authorized to make this request.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorObject"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "serviceName": "MSG",
                                            "code": "MSG-2",
                                            "httpStatusCode": 401,
                                            "message": "You are not authorized to make this request.",
                                            "inputParams": "params",
                                            "endpointUrl": "url"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "description": "Store message input encrypted with randomly generated symmetric key.\n\nParams:\n\n  `message` - data to be stored\n\n  `type` - type of the message, can be any string value, for example: **vc**, **vp**, **jws**\n\n  `ttlInMinutes` - time to live in minutes\n\nReturns shared message id, URL, QR(its QR data builder from URL) and symmetric key, which was used to encrypt it",
                "tags": [
                    "SharedMessage"
                ],
                "security": [
                    {
                        "bearerAuth": []
                    }
                ],
                "parameters": [],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/SharedMessageInput"
                            },
                            "example": {
                                "ttlInMinutes": "10",
                                "message": {
                                    "field1": "value1",
                                    "field2": "val2"
                                },
                                "type": "messageType"
                            }
                        }
                    }
                }
            }
        },
        "/sharedMessage/index-my-shared-messages": {
            "post": {
                "operationId": "IndexMySharedMessages",
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/IndexMyOutput"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "sharedMessages": [
                                                {
                                                    "id": "123e4567-e89b-12d3-a456-426614174000",
                                                    "did": "did:elem:EiBhdMQDP-nmL3aoFuqkiR_uYo8DvZi83zRdSRvOMkG9cw",
                                                    "type": "messageType",
                                                    "data": "{\"field1\": \"value1\", \"field2\": \"val2\"}",
                                                    "expiresAt": "2022-11-20T02:15:30.000Z",
                                                    "createdAt": "2022-09-20T02:15:30.000Z"
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "You are not authorized to make this request.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorObject"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "serviceName": "MSG",
                                            "code": "MSG-2",
                                            "httpStatusCode": 401,
                                            "message": "You are not authorized to make this request.",
                                            "inputParams": "params",
                                            "endpointUrl": "url"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "description": "Get all shared messages for did, derived from auth token and for declared type if that provided and return it.",
                "tags": [
                    "SharedMessage"
                ],
                "security": [
                    {
                        "bearerAuth": []
                    }
                ],
                "parameters": [],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/IndexMyInputParams"
                            },
                            "example": {
                                "type": "messageType"
                            }
                        }
                    }
                }
            }
        },
        "/sharedMessage/{sharedMessageId}": {
            "get": {
                "operationId": "ReadSharedMessage",
                "responses": {
                    "200": {
                        "description": "Content"
                    },
                    "401": {
                        "description": "You are not authorized to make this request.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorObject"
                                },
                                "examples": {
                                    "Example 1": {
                                        "value": {
                                            "serviceName": "MSG",
                                            "code": "MSG-2",
                                            "httpStatusCode": 401,
                                            "message": "You are not authorized to make this request.",
                                            "inputParams": "params",
                                            "endpointUrl": "url"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "description": "Get decrypted message by id.\n\nParams:\n\n  `sharedMessageId` - data to be stored\n\n  `key` - encryption key, which will be used to decrypt the message\n\n  `format` - format of the message, should be 'json' or 'html'\n\n  Based on the format returns message on JSON or HTML, if the parameter is not provided returns HTML",
                "tags": [
                    "SharedMessage"
                ],
                "security": [],
                "parameters": [
                    {
                        "in": "path",
                        "name": "sharedMessageId",
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
                    },
                    {
                        "in": "query",
                        "name": "format",
                        "required": false,
                        "schema": {
                            "$ref": "#/components/schemas/FormatEnum"
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
    ],
    "tags": [
        {
            "name": "DidAuthentication",
            "description": "This section describes DID authentication. The DID authentication flow is described in ",
            "externalDocs": {
                "description": "affinidi-did-auth-lib.",
                "url": "https://github.com/affinityproject/affinidi-core-sdk/tree/master/common-libs/did-auth-lib#affinidi-did-auth-helpers"
            }
        },
        {
            "name": "Message",
            "description": "This section contains APIs related to messaging service between DIDs. \nIt allows to send messages to specific DID, retrieve messages by your DID and delete messages by ID."
        },
        {
            "name": "SharedMessage",
            "description": "This section contains APIs related to messaging service between multiple DIDs. \nIt allows to store shared messages encrypted with symmetric key for a fixed period of time. \nShared messages can be retrieved by ID, URL or QR and decrypted using symmetric key."
        }
    ]
} as const
