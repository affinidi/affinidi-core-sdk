import nodeFetch, { RequestInfo, RequestInit, Response } from 'node-fetch'
import { request as undiciRequest } from 'undici'
import { setFetchImpl } from '@affinidi/platform-fetch'

type FetchType = (url: RequestInfo, init?: RequestInit) => Promise<Response>

export const useNodeFetch = () => {
  if (process.env.HTTP_CLIENT === 'undici') {
    setFetchImpl(async (url, options) => {
      const response = await undiciRequest((url as URL).href ?? url, options)

      return {
        status: response.statusCode,
        json: () => response.body.json(),
      } as Response
    })
  } else {
    setFetchImpl(nodeFetch)
  }
}
