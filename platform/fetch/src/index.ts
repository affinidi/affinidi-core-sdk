import type { RequestInfo, RequestInit, Response } from 'node-fetch'
import { request as undiciRequest } from 'undici/types/api'

type OptionsType = RequestInit & Parameters<typeof undiciRequest>[1]

type FetchType = (url: RequestInfo, options?: OptionsType) => Promise<Response>

let fetch: FetchType | null = null

export const getFetch = () => {
  if (!fetch) {
    throw new Error('fetch is not configured')
  }

  return fetch
}

export const configureFetch = (inputFetch: FetchType) => {
  fetch = inputFetch
}
