import { didDocument } from './didDocument'

export const did = 'did:jolo:569d3f3c3fb5f43568a6fd615f1e09dee169bf98b201813d7f998e241be7ff0e'
export const did1 = 'did:jolo:469d3f3c3fb5f43568a6fd615f1e09dee169bf98b201813d7f998e241be7ff0e'
export const did2 = 'did:jolo:369d3f3c3fb5f43568a6fd615f1e09dee169bf98b201813d7f998e241be7ff0e'

export const response = {
  body: {
    requestBody: {
      did: did,
    },
    responseBody: {
      didDocument: didDocument,
    },
  },
  status: 200,
}
