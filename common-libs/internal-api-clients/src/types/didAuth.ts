export type DidAuthOperation = {
  requestBody: {
    readonly audienceDid: string
  }
  responseBody: string
  pathParams: undefined
  queryParams: undefined
}

export type PossibleDidAuthOperationIdsOf<T> = {
  [K in keyof T]-?: T[K] extends DidAuthOperation ? K : never
}[keyof T]
