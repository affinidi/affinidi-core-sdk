import warning from 'tiny-warning'
import { absoluteURIRegex } from '../shared'

export type Signer = {
  did: string
  keyId: string
  privateKey: string
  publicKey: string
}

export type GetSignSuiteOptions = {
  controller: string
  keyId: string
  privateKey: string
  publicKey: string
}

export type GetSignSuiteFn = (options: GetSignSuiteOptions) => any | Promise<any>

export type GetProofPurposeOptionsOptions = {
  controller: string
  keyId: string
}

export type GetProofPurposeOptionsFn<T extends Record<string, any>> = (
  options: GetProofPurposeOptionsOptions,
) => T | Promise<T>

export const removeIfExists = <T>(input: T | T[] | undefined, ...items: (T | undefined)[]) => {
  if (typeof input === 'undefined') {
    return []
  }

  const array = (Array.isArray(input) ? input : [input]).slice()
  for (const item of items) {
    if (typeof item === 'undefined') continue

    const foundIndex = array.indexOf(item)
    if (foundIndex >= 0) {
      array.splice(foundIndex, 1)
    }
  }

  return array
}

export const validateId = (id: string, shouldThrow = false) => {
  if (!absoluteURIRegex.test(id)) {
    const message =
      'VC ids must be absolute URIs ' +
      '(https://www.w3.org/TR/vc-data-model/#identifiers). ' +
      'To use UUIDs prefix the UUID with "urn:uuid:" ' +
      '(eg. "urn:uuid:11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000")'

    if (shouldThrow) {
      throw new Error(message)
    }

    warning(false, message)
  }
}
