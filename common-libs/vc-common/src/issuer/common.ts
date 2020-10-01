export type Signer = {
  did: string
  keyId: string
  privateKey: string
}

export type GetSignSuiteOptions = {
  controller: string
  keyId: string
  privateKey: string
}

export type GetSignSuiteFn = (options: GetSignSuiteOptions) => any | Promise<any>

export type GetProofPurposeOptionsOptions = {
  controller: string
  keyId: string
}

export type GetProofPurposeOptionsFn<T extends Record<string, any>> = (
  options: GetProofPurposeOptionsOptions,
) => T | Promise<T>
