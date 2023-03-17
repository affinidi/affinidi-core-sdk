import { getBrowerCrypto, getSubtleCrypto } from './browser';

export function isBrowser(): boolean {
  return !!getBrowerCrypto() && !!getSubtleCrypto();
}

export function isNode(): boolean {
  return (
    typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    typeof process.versions.node !== 'undefined'
  );
}
