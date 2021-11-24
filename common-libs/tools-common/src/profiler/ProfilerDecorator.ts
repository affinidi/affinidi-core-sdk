import { ConsoleReporter } from './ConsoleReporter'
import { DefaultProfilerActivator } from './DefaultProfilerActivator'
import { IProfilerRecorder } from './IProfilerRecorder'
import { IProfilerActivator } from './IProfileActivator'
import { PrometheusRecorder } from './PrometheusRecorder'
const scanListSymbol = Symbol('profilerMetaScan')
export enum ProfileAction {
  default,
  sdkOptionsScan,
  entry,
  ignore,
}
export interface ProfilerScanMetadata {
  key: string
  action: ProfileAction
}
const scalableActions = [ProfileAction.entry, ProfileAction.sdkOptionsScan]
const shouldScan = (action?: ProfileAction): boolean => scalableActions.includes(action)

const ProfilerActivationPropertyName = 'isProfilerActive'
const isPromise = (obj: any): boolean => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

export const getNowTimeStamp = (): number => Date.now()

function scanSdkOptions(
  action: ProfileAction,
  args: any[],
  activator: IProfilerActivator,
  obj: any,
  recorder: IProfilerRecorder,
) {
  if (action === ProfileAction.sdkOptionsScan) {
    const profilerOptions = [...args].find(
      (a: any) => typeof a === 'object' && a && typeof a[ProfilerActivationPropertyName] === 'boolean',
    )
    if (profilerOptions && profilerOptions[ProfilerActivationPropertyName]) {
      if (activator.isActive() !== profilerOptions[ProfilerActivationPropertyName]) {
        activator.setActive(profilerOptions.isProfilerActive)
        //TODO : think about deactivate case
        if (activator.isActive()) {
          wrapClass(obj, recorder, activator, action)
        }
      }
    }
  }
}

function wrapFunction(
  obj: any,
  key: PropertyKey,
  className: string,
  recorder: IProfilerRecorder,
  activator: IProfilerActivator,
  action: ProfileAction = ProfileAction.default,
) {
  const descriptor = Reflect.getOwnPropertyDescriptor(obj, key)
  if (!descriptor || descriptor.get || descriptor.set) {
    return
  }

  if (key === 'constructor') {
    return
  }

  const originalFunction = descriptor.value
  if (!originalFunction || typeof originalFunction !== 'function') {
    return
  }

  // set a key for the object in memory
  if (!className) {
    className = obj.constructor ? `${obj.constructor.name}` : ''
  }

  const name = key.toString()

  // set a tag so we don't wrap a function twice
  const savedName = `__scan__${name}__`
  if (Reflect.has(obj, savedName)) {
    return
  }

  const wrappedFunction = function (this: any, ...args: any[]) {
    if (activator.isActive() || shouldScan(action)) {
      scanSdkOptions(action, args, activator, obj, recorder)
      const start = getNowTimeStamp()
      const result = originalFunction.apply(this, args)
      if (isPromise(result)) {
        return result
          .then(() => {
            recorder.record(name, className, start, getNowTimeStamp())
            return result
          })
          .catch(() => {
            recorder.record(name, className, start, getNowTimeStamp())
            return result
          })
      }

      recorder.record(name, className, start, getNowTimeStamp())
      return result
    }

    return originalFunction.apply(this, args)
  }

  Reflect.set(obj, savedName, originalFunction)
  Reflect.set(obj, key, wrappedFunction, obj)
}

function wrapChain(
  chain: any,
  className: string,
  profilerRecorder: IProfilerRecorder,
  profileActivator: IProfilerActivator,
  action: ProfileAction,
) {
  if (action === ProfileAction.ignore) {
    return
  }

  const scanList = Reflect.get(chain, scanListSymbol) || ([] as ProfilerScanMetadata[])
  const scanMap: Record<string, ProfilerScanMetadata> = scanList.reduce(
    (result: Record<string, ProfilerScanMetadata>, value: ProfilerScanMetadata) => {
      result[value.key] = value
      return result
    },
    {},
  )
  Reflect.ownKeys(chain).forEach((k) => {
    const meta = scanMap[k.toString()]
    const action = meta ? meta.action : null
    if (action !== ProfileAction.ignore && DefaultProfilerActivator.isActive()) {
      wrapFunction(chain, k, className, profilerRecorder, profileActivator, action)
    }

    if (shouldScan(action)) {
      wrapFunction(chain, k, className, profilerRecorder, profileActivator, action)
    }
  })
}

function wrapClass(
  target: any,
  profilerRecorder: IProfilerRecorder,
  profileActivator: IProfilerActivator,
  action: ProfileAction,
) {
  const ctor = target as any
  if (!ctor.prototype) {
    return
  }

  const className = ctor.name

  wrapChain(ctor.prototype, '', profilerRecorder, profileActivator, action)
  wrapChain(ctor, className, profilerRecorder, profileActivator, action)
}

const ensureProfilerRecorderSet = (profilerRecorder?: IProfilerRecorder): IProfilerRecorder => {
  if (typeof profilerRecorder !== 'undefined') {
    return profilerRecorder
  }

  if (process.env.PROFILER_RECORDER === 'prometheus') {
    return PrometheusRecorder
  }

  return ConsoleReporter
}

export const profile = (
  action: ProfileAction = ProfileAction.default,
  profilerRecorder?: IProfilerRecorder,
  profileActivator: IProfilerActivator = DefaultProfilerActivator,
) => (
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: object | Function,
  key?: string | symbol,
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/ban-types
  _descriptor?: TypedPropertyDescriptor<Function>,
): void => {
  if (key) {
    Reflect.set(target, scanListSymbol, (Reflect.get(target, scanListSymbol) || []).concat({ key, action }))
    return
  }

  wrapClass(target, ensureProfilerRecorderSet(profilerRecorder), profileActivator, action)
}
