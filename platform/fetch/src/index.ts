import type { RequestInfo, RequestInit, Response } from 'node-fetch'
import { request as undiciRequest } from 'undici/types/api'

type OptionsType = RequestInit & Parameters<typeof undiciRequest>[1]

type FetchType = (url: RequestInfo, options?: OptionsType) => Promise<Response>

let fetchImpl: FetchType | null = null

export const fetch: FetchType = (url: RequestInfo, options?: OptionsType) => {
  if (!fetchImpl) {
    throw new Error('fetch is not configured')
  }

  return fetchImpl(url, options)
}

export const configureFetch = (inputFetch: FetchType) => {
  fetchImpl = inputFetch
}
