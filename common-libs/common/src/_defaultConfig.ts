export const DEFAULT_REGISTRY_URL = 'https://affinity-registry.staging.affinity-project.org'
export const DEFAULT_METRICS_URL = 'https://affinity-metrics.staging.affinity-project.org'

export const JOLO_DID_METHOD = 'jolo'
export const ELEM_DID_METHOD = 'elem'
export const ELEM_ANCHORED_DID_METHOD = 'elem-anchored'
export const DEFAULT_DID_METHOD = JOLO_DID_METHOD
export const SUPPORTED_DID_METHODS = [JOLO_DID_METHOD, ELEM_DID_METHOD, ELEM_ANCHORED_DID_METHOD] as const
