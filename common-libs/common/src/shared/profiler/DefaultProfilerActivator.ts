import { IProfilerActivator } from './IProfileActivator'

const profilerVars = ['EXPO_PROFILER', 'REACT_NATIVE_PROFILER', 'REACT_APP_PROFILER', 'PROFILER']
const extractFromEvn = (): boolean => {
  if (process && process.env) {
    return Object.keys(process.env).findIndex((i) => profilerVars.includes(i)) !== -1
  }

  return false
}
let active = extractFromEvn()
export const DefaultProfilerActivator: IProfilerActivator = {
  isActive: () => active,
  setActive: (status: boolean | undefined) => {
    active = typeof status === 'boolean' ? status : extractFromEvn()
    return active
  },
}
