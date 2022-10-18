import merge from 'lodash.merge'
import mapValues from 'lodash.mapvalues'

const NESTED_FIELDS_SEPARATOR = '/'

export const buildObjectSkeletonFromPaths = (paths: string[] = [], credentialSubject: any): Record<string, any> => {
  // NOTE: for legacy implementation compatibility (when field "data" in credentialSubject was only one root field)
  const isLegacy = hasOnlyDataField(credentialSubject) && !hasDataAsRootField(paths)
  const pathsAsObjects = paths.map(buildPathAsObject(credentialSubject, isLegacy))
  return merge({}, ...pathsAsObjects)
}

const hasOnlyDataField = (credentialSubject: any) =>
  Object.keys(credentialSubject).length === 1 && !!credentialSubject.data

const hasDataAsRootField = (paths: string[]) => !!paths[0] && paths[0].startsWith('data/')

const buildPathAsObject = (credentialData: any, isLegacy: boolean) => (path: string): Record<string, any> => {
  const splitPath = path.split(NESTED_FIELDS_SEPARATOR)

  if (isLegacy) splitPath.unshift('data')

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
