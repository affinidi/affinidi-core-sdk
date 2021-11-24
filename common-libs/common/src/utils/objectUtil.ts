export const buildObjectSkeletonFromPaths = (paths: string[] = []): Record<string, any> => {
  const pathsAsObjects = paths.map(buildPathAsObject)
  return mergeDeep({}, ...pathsAsObjects)
}

export const buildPathAsObject = (path: string): Record<string, any> => {
  if (!path.includes('.')) {
    return { [path]: {} }
  }

  const splitPath = path.split('.')
  return splitPath.reduceRight((res, field) => ({ [field]: res }), {})
}

export const validateObjectHasPaths = (
  object: Record<string, any>,
  paths: string[] = [],
): { field: string; path: string }[] => {
  const errors: { field: string; path: string }[] = []
  paths.forEach((path) => {
    const splitPath = path.split('.')
    let hasError = false
    splitPath.reduce((fragment, field) => {
      if (hasError) return undefined

      if (fragment[field] === undefined || fragment[field] === null) {
        errors.push({ field, path })
        hasError = true
        return undefined
      }

      return fragment[field]
    }, object)
  })

  return errors.length > 0 ? errors : undefined
}

export const injectFieldForAllParentRoots = (
  target: Record<string, any>,
  field: string,
  value: unknown,
): Record<string, any> => {
  const keys = Object.keys(target)
  if (keys.length > 0) {
    target[field] = value
    keys.forEach((key) => injectFieldForAllParentRoots(target[key], field, value))
  }

  return target
}

export const mergeDeep = (target: Record<string, any>, ...sources: Record<string, any>[]): Record<string, any> => {
  if (!sources.length) return target
  const source = sources.shift()

  Object.keys(source).forEach((key) => {
    if (source[key]) {
      if (!target[key]) Object.assign(target, { [key]: {} })
      mergeDeep(target[key], source[key])
    } else {
      Object.assign(target, { [key]: source[key] })
    }
  })

  return mergeDeep(target, ...sources)
}
