import { reactNativeAesEncrypt, reactNativeAesDecrypt } from './lib/reactnative'

export async function aesCbcEncrypt(iv: Buffer, key: Buffer, data: Buffer): Promise<Buffer> {
  const result = reactNativeAesEncrypt(iv, key, data)

  return result
}

export async function aesCbcDecrypt(iv: Buffer, key: Buffer, data: Buffer): Promise<Buffer> {
    const result = reactNativeAesDecrypt(iv, key, data)
  return result
}
