import merge from 'lodash.merge'
import mapValues from 'lodash.mapvalues'

const NESTED_FIELDS_SEPARATOR = '/'

export const buildObjectSkeletonFromPaths = (paths: string[] = []): Record<string, any> => {
  const pathsAsObjects = paths.map(buildPathAsObject)
  return merge({}, ...pathsAsObjects)
}

export const buildPathAsObject = (path: string): Record<string, any> => {
  if (!path.includes(NESTED_FIELDS_SEPARATOR)) {
    return { [path]: {} }
  }

  const splitPath = path.split(NESTED_FIELDS_SEPARATOR)
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
