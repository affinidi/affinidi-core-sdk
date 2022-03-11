import merge from 'lodash.merge'
import mapValues from 'lodash.mapvalues'

const NESTED_FIELDS_SEPARATOR = '/'

export const buildObjectSkeletonFromPaths = (paths: string[] = [], credentialData: any): Record<string, any> => {
  const pathsAsObjects = paths.map(buildPathAsObject(credentialData))
  return merge({}, ...pathsAsObjects)
}

const buildPathAsObject = (credentialData: any) => (path: string): Record<string, any> => {
  const splitPath = path.split(NESTED_FIELDS_SEPARATOR)
  const credentialFieldValue = splitPath.reduce((res, field) => res?.[field], credentialData)
  if (credentialFieldValue === undefined) {
    throw new Error(`Field "${path}" not a part of credential`)
  }

  return splitPath.reduceRight((res, field) => ({ [field]: res }), {})
}

export const injectFieldForAllParentRoots = (
  target: Record<string, any>,
  field: string,
  value: unknown,
): Record<string, any> => {
  const keys = Object.keys(target)
  if (keys.length === 0) return target
  return {
    [field]: value,
    ...mapValues(target, (targetValue) => injectFieldForAllParentRoots(targetValue, field, value)),
  }
}
