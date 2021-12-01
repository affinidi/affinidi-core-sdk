import mapValues from 'lodash.mapvalues'

type BasicResultFunction = (this: any, ...rest: any) => Promise<any>

type PromisedReturnType<TFunction extends BasicResultFunction> = TFunction extends (
  this: any,
  ...rest: any
) => Promise<infer U>
  ? U
  : never

type InputFunction<TResultFunction extends BasicResultFunction> = (
  self: ThisParameterType<TResultFunction>,
  ...rest: Parameters<TResultFunction>
) => Promise<PromisedReturnType<TResultFunction>>

type InputMapper<TSource extends Record<string, unknown>, TResultFunction extends BasicResultFunction> = (
  value: TSource[keyof TSource],
  key: keyof TSource,
) => InputFunction<TResultFunction>

export const mapFunctions = <TSource extends Record<string, unknown>, TResultFunction extends BasicResultFunction>(
  obj: TSource,
  inputMapper: InputMapper<TSource, TResultFunction>,
): Record<keyof TSource, TResultFunction> =>
  mapValues(
    obj,
    (value: TSource[keyof TSource], key: string): TResultFunction => {
      const mappedInput = inputMapper(value, key as keyof TSource)

      // we could simply return a function here, but then it would not have a display name
      // and wouldn't show up in stacktraces properly,
      // so we have to make a temporary object here in order for function to get a display name
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name#inferred_function_names
      const functionObject = {
        [key]: async function (
          this: ThisParameterType<TResultFunction>,
          ...args: Parameters<TResultFunction>
        ): Promise<PromisedReturnType<TResultFunction>> {
          const promise = mappedInput(this, ...args)
          const result: PromisedReturnType<TResultFunction> = await promise
          return result
        },
      }

      const f = functionObject[key]
      return f as TResultFunction
    },
  )
