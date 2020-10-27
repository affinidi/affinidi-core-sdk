import { L, O } from 'ts-toolbelt'
import { VCV1, VCV1Type, SimpleThing } from '@affinidi/vc-common'
export { MaybeArray } from '@affinidi/vc-common'

type SimpleThingString = { '@type': string }

// Helpers For Creating Types

export type CreateThing<Type extends string, D extends Record<any, any> = Record<any, any>> = D & {
  '@type': Type
}

export type FlattenType<Extension extends SimpleThingString, Base extends SimpleThing> = L.Flatten<
  L.Concat<[Base['@type']], [Extension['@type']]>
>

export type ExpandType<Obj extends SimpleThing> = {
  '@type': Obj['@type'] extends string[]
    ? L.Concat<Obj['@type'], string[]>
    : Obj['@type'] | L.Concat<[Obj['@type']], string[]>
} & OmitType<Obj>

export type Type<T extends string> = [VCV1Type[0], T, ...string[]]

export type AddKeyPairs<Obj extends { [key: string]: any }> = Obj & {
  [key: string]: any
}

export type ExtendThing<Extension extends SimpleThingString, Base extends SimpleThing> = {
  '@type': FlattenType<Extension, Base>
} & MergeAndOmitType<Extension, Base>

export type ExpandThing<Thing extends SimpleThing> = AddKeyPairs<ExpandType<Thing>>

export type CreateExpandedThing<Type extends string, D extends Record<any, any> = Record<any, any>> = ExpandThing<
  CreateThing<Type, D>
>

// Helpers For Creating Context

const vocabs = {
  schema: 'https://schema.org/',
  affSchema: 'https://schema.affinity-project.org/',
  fhir: 'http://hl7.org/fhir/',
}

type Vocab = keyof typeof vocabs

export const createVCContextEntry = <VC extends VCV1>({
  type,
  typeIdBase,
  vocab,
  entries,
}: {
  type: VC['type'][1]
  typeIdBase: Vocab
  vocab?: Vocab
  entries: { [key: string]: any }[]
}) => {
  const entry: { [key: string]: any } = {
    [type]: {
      '@id': `${vocabs[typeIdBase]}${type}`,
      '@context': {
        '@version': 1.1,
        '@protected': true,
      },
    },
    data: {
      '@id': `${vocabs['affSchema']}data`,
      '@context': [
        null,
        {
          '@version': 1.1,
          '@protected': true,
          '@vocab': typeof vocab === 'undefined' ? null : vocabs[vocab],

          ...combineContextEntries({ entries }),
        },
      ],
    },
  }

  return entry
}

export const createContextEntry = <
  Extension extends SimpleThingString,
  Base extends { [key: string]: any } = SimpleThing
>({
  type,
  typeIdBase,
  fields,
  vocab,
}: {
  type: Extension['@type']
  typeIdBase: Vocab
  fields: {
    [key in keyof ExcludeAndOmitType<Extension, Base>]-?: Vocab
  }
  vocab?: Vocab
}) => {
  const entry: { [key: string]: any } = {
    [type]: {
      '@id': `${vocabs[typeIdBase]}${type}`,
      '@context': {
        '@version': 1.1,
        '@protected': true,
        '@vocab': typeof vocab === 'undefined' ? null : vocabs[vocab],
      },
    },
  }

  if (Object.keys(fields).length > 0) {
    Object.keys(fields).forEach((_key) => {
      const key = _key as keyof ExcludeAndOmitType<Extension, Base>
      entry[type]['@context'][key] = `${vocabs[fields[key]]}${key}`
    })
  }

  return entry
}

export const combineContextEntries = ({ entries }: { entries: { [key: string]: any }[] }) => {
  const combined: { [key: string]: any } = {}
  for (const entry of entries) {
    Object.keys(entry).forEach((type) => {
      const entryValue = entry[type]

      if (combined[type]) throw new Error(`Type ${type} is already defined in this context`)

      combined[type] = entryValue
    })
  }

  return combined
}

// General Helpers

export type OmitType<O> = Omit<O, '@type'>

export type MergeAndOmitType<O extends Record<any, any>, O1 extends Record<any, any>> = O.Exclude<
  OmitType<O>,
  OmitType<O1>
> &
  OmitType<O1>

export type ExcludeAndOmitType<O extends Record<any, any>, O1 extends Record<any, any>> = O.Exclude<
  OmitType<O>,
  OmitType<O1>
>
