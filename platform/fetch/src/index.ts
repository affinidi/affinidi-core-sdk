type OptionsType = {
  headers?: Record<string, string>
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: string
}

type Response = {
  headers: {
    get(name: string): string | null
  }
  status: number
  json(): Promise<any>
  text(): Promise<string>
}

type FetchType = (url: string, options?: OptionsType) => Promise<Response>

let fetchImpl: FetchType | null = null

export const fetch: FetchType = (url, options) => {
  if (!fetchImpl) {
    throw new Error('fetch is not configured')
  }

  return fetchImpl(url, options)
}

export const setFetchImpl = (inputFetch: FetchType) => {
  fetchImpl = inputFetch
}
