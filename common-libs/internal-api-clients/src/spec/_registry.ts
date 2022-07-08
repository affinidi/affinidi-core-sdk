/* eslint-disable */
export default {
  "components": {
    "examples": {},
    "headers": {},
    "parameters": {},
    "requestBodies": {},
    "responses": {},
    "schemas": {
      "PutDocumentInIpfsOutput": {
        "properties": {
          "hash": {
            "type": "string"
          }
        },
        "required": [
          "hash"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "PutDocumentInIpfsInput": {
        "properties": {
          "document": {
            "properties": {},
            "additionalProperties": {},
            "type": "object"
          }
        },
        "required": [
          "document"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "CreateAnchorTransactionOutput": {
        "properties": {
          "digestHex": {
            "type": "string"
          }
        },
        "required": [
          "digestHex"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "CreateAnchorTransactionInput": {
        "properties": {
          "did": {
            "type": "string",
            "pattern": "^did:(elem|jolo|polygon):.*$"
          },
          "nonce": {
            "type": "number",
            "format": "double"
          },
          "didDocumentAddress": {
            "type": "string"
          },
          "publicKeyBase58": {
            "type": "string"
          }
        },
        "required": [
          "did"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "TransactionCountOutput": {
        "properties": {
          "transactionCount": {
            "type": "number",
            "format": "double"
          }
        },
        "required": [
          "transactionCount"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "TransactionCountInput": {
        "properties": {
          "ethereumPublicKeyHex": {
            "type": "string"
          }
        },
        "required": [
          "ethereumPublicKeyHex"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "AnchorDidOutput": {
        "properties": {
          "did": {
            "type": "string",
            "pattern": "^did:(elem|jolo):.*$"
          }
        },
        "required": [
          "did"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "AnchorDidInput": {
        "properties": {
          "did": {
            "type": "string",
            "pattern": "^did:(elem|jolo|polygon):.*$"
          },
          "transactionSignatureJson": {
            "type": "string"
          },
          "didDocumentAddress": {
            "type": "string"
          },
          "nonce": {
            "type": "number",
            "format": "double"
          },
          "anchoredDidElem": {
            "type": "boolean",
            "description": "backward compatibility for old versions of sdk."
          },
          "ethereumPublicKeyHex": {
            "type": "string"
          },
          "publicKeyBase58": {
            "type": "string"
          },
          "origin": {
            "type": "string"
          }
        },
        "required": [
          "did",
          "transactionSignatureJson"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ResolveDidOutput": {
        "properties": {
          "didDocument": {
            "properties": {},
            "additionalProperties": {},
            "type": "object"
          }
        },
        "required": [
          "didDocument"
        ],
        "type": "object",
        "additionalProperties": false
      },
      "ResolveDidInput": {
        "properties": {
          "did": {
            "type": "string",
            "pattern": "^did:(elem|jolo|key|web|polygon):.*$"
          }
        },
        "required": [
          "did"
        ],
        "type": "object",
        "additionalProperties": false
      }
    },
    "securitySchemes": {}
  },
  "info": {
    "title": "affinity-registry",
    "version": "0.21.0",
    "description": "Affinity Registry",
    "license": {
      "name": "ISC"
    },
    "contact": {
      "name": "Denis Popov ",
      "email": "denis.p@affinidi.com"
    }
  },
  "openapi": "3.0.0",
  "paths": {
    "/did/put-in-ipfs": {
      "post": {
        "operationId": "PutDocumentInIpfs",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PutDocumentInIpfsOutput"
                }
              }
            }
          }
        },
        "description": "Put signed by client DID document in IPFS and return hash that links to the document",
        "summary": "Saves DID document in IPFS",
        "tags": [
          "DID"
        ],
        "security": [],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PutDocumentInIpfsInput"
              }
            }
          }
        }
      }
    },
    "/did/anchor-transaction": {
      "post": {
        "operationId": "CreateAnchorTransaction",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateAnchorTransactionOutput"
                }
              }
            }
          }
        },
        "description": "Create Anchor transaction for blockchain and return digest hex of it",
        "summary": "Create Anchor transaction",
        "tags": [
          "DID"
        ],
        "security": [],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateAnchorTransactionInput"
              }
            }
          }
        }
      }
    },
    "/did/transaction-count": {
      "post": {
        "operationId": "TransactionCount",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TransactionCountOutput"
                }
              }
            }
          }
        },
        "description": "Get transaction count from blockchain for current wallet",
        "summary": "Create Anchor transaction",
        "tags": [
          "DID"
        ],
        "security": [],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TransactionCountInput"
              }
            }
          }
        }
      }
    },
    "/did/anchor-did": {
      "post": {
        "operationId": "AnchorDid",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AnchorDidOutput"
                }
              }
            }
          }
        },
        "description": "Anchor DID document in blockchain and return transaction hash",
        "summary": "Anchors DID document",
        "tags": [
          "DID"
        ],
        "security": [],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AnchorDidInput"
              }
            }
          }
        }
      }
    },
    "/did/convert-did-elem": {
      "post": {
        "operationId": "ConvertToDidElement",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AnchorDidOutput"
                }
              }
            }
          }
        },
        "tags": [
          "DID"
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
                "$ref": "#/components/schemas/AnchorDidInput"
              }
            }
          }
        }
      }
    },
    "/did/resolve-did": {
      "post": {
        "operationId": "ResolveDid",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ResolveDidOutput"
                }
              }
            }
          }
        },
        "description": "Resolve DID document from IPFS",
        "summary": "Resolves DID document",
        "tags": [
          "DID"
        ],
        "security": [],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ResolveDidInput"
              }
            }
          }
        }
      }
    },
    "/did/anchor-did-element": {
      "post": {
        "operationId": "AnchorDidElement",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AnchorDidOutput"
                }
              }
            }
          }
        },
        "description": "Anchor DID document via Element DID method",
        "summary": "Anchors DID Element",
        "tags": [
          "DID"
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
                "$ref": "#/components/schemas/AnchorDidInput"
              }
            }
          }
        }
      }
    },
    "/did/resolve-did-element": {
      "post": {
        "operationId": "ResolveDidElement",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ResolveDidOutput"
                }
              }
            }
          }
        },
        "description": "Resolve DID Element document from IPFS",
        "summary": "Resolves DID document anchored via Element Sidetree",
        "tags": [
          "DID"
        ],
        "security": [],
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ResolveDidInput"
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
