import { Headers } from 'node-fetch'

type createHeadersOptions = {
  accessApiKey: string
  sdkVersion?: string
}

const defaultHeaderValue = 'unknown'

export const createHeaders = (options: createHeadersOptions): Headers => {
  const headers = new Headers({
    Accept: 'application/json',
    'Api-Key': options.accessApiKey,
    'Content-Type': 'application/json',
    'X-SDK-Version': options.sdkVersion || defaultHeaderValue,
  })

  return headers
}

type updateHeadersOptions = {
  authorization?: string
  storageRegion?: string
}

export const updateHeaders = (headers: Headers, options: updateHeadersOptions) => {
  options.authorization && headers.append('Authorization', options.authorization)
  options.storageRegion && headers.append('X-DST-REGION', options.storageRegion)

  return headers
}
