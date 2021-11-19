export type Simplify<T> = T extends Record<string, unknown> | unknown[]
  ? T extends infer O
    ? { [K in keyof O]: Simplify<O[K]> }
    : never
  : T

export type StaticBoolean<T extends boolean> = T extends true ? true : T extends false ? false : never

export type RemoveEmpty<T> = T extends Record<string, never> ? undefined : T

export type SafeGetArray<T extends readonly any[] | undefined> = T extends readonly any[] ? T : []

export type Tail<T extends readonly any[]> = T extends readonly [any, ...(infer R)] ? R : []
