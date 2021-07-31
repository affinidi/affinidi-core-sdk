type createHeadersOptions = {
  accessApiKey: string
  sdkVersion?: string
}

const defaultHeaderValue = 'unknown'

export type ApiRequestHeaders = { [key: string]: string }

export const createHeaders = (options: createHeadersOptions): ApiRequestHeaders => {
  return {
    Accept: 'application/json',
    'Api-Key': options.accessApiKey,
    'Content-Type': 'application/json',
    'X-SDK-Version': options.sdkVersion || defaultHeaderValue,
  }
}

type updateHeadersOptions = {
  authorization?: string
  storageRegion?: string
}

export const getExtendedHeaders = (headers: ApiRequestHeaders, options: updateHeadersOptions): ApiRequestHeaders => {
  return {
    ...headers,
    ...(options.authorization && { Authorization: options.authorization }),
    ...(options.storageRegion && { 'X-DST-REGION': options.storageRegion }),
  }
}
