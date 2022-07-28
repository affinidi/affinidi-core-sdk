export const JOLO_DID_METHOD = 'jolo'
export const POLYGON_DID_METHOD = 'polygon'
export const POLYGON_TESTNET_DID_METHOD = 'polygon:testnet'
export const ELEM_DID_METHOD = 'elem'
export const ELEM_ANCHORED_DID_METHOD = 'elem-anchored'
export const DEFAULT_DID_METHOD = JOLO_DID_METHOD
export const SUPPORTED_DID_METHODS = [
  JOLO_DID_METHOD,
  ELEM_DID_METHOD,
  ELEM_ANCHORED_DID_METHOD,
  POLYGON_DID_METHOD,
  POLYGON_TESTNET_DID_METHOD,
] as const
