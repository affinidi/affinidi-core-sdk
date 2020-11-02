export type ContextObjDetailedItem = {
  [key: string]: undefined | string | Record<string, unknown>
  '@id': string
  '@type': string
}

export type ContextObj = {
  [key: string]: undefined | number | string | ContextObjDetailedItem
  '@version'?: number
  '@base'?: string
  '@vocab'?: string
}

export type TContext = string | ContextObj | (string | ContextObj)[]

export type DocumentLoaderResult = {
  contextUrl: null | string
  document: any
  documentUrl: string
}

export type DocumentLoader = (url: string) => Promise<DocumentLoaderResult> | DocumentLoaderResult

export const absoluteURIRegex = /^([A-Za-z][A-Za-z0-9+-.]*|_):/
