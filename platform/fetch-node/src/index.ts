import nodeFetch from 'node-fetch'
import { request as undiciRequest } from 'undici'
import { setFetchImpl } from '@affinidi/platform-fetch'

const NODE_FETCH_DEFAULT_REDIRECT_COUNT = 20

export const useNodeFetch = () => {
  if (process.env.HTTP_CLIENT === 'undici') {
    // adapting undici to fetch-like interface
    setFetchImpl(async (url, options) => {
      const response = await undiciRequest(url, {
        maxRedirections: NODE_FETCH_DEFAULT_REDIRECT_COUNT,
        ...options,
      } as any)

      return {
        headers: {
          get: (name) => {
            const header = response.headers[name]
            if (Array.isArray(header)) {
              return header.join('\n')
            }

            if (header == undefined) {
              return null
            }

            return header
          },
        },
        json: () => response.body.json(),
        status: response.statusCode,
      }
    })
  } else {
    setFetchImpl(nodeFetch)
  }
}
