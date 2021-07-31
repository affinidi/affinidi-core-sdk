import { createContextEntry, CreateThing, createVCContextEntry, ExpandThing, ExtendThing, Type } from '../util'
import { VCV1, VCV1Subject } from '@affinidi/vc-common'
import { getBaseV1ContextEntries } from '../base'

type ThingMixin = CreateThing<'Thing', { name: string }>

type CreativeWorkMixin = CreateThing<
  'CreativeWork',
  {
    encodingFormat: string
  }
>

type CreativeWork = ExtendThing<CreativeWorkMixin, ThingMixin>

type MediaObjectMixin = CreateThing<
  'MediaObject',
  {
    sha256: string
    contentSize: string
    contentUrl?: string
  }
>

type MediaObject = ExtendThing<MediaObjectMixin, CreativeWork>

type FileV1Mixin = CreateThing<
  'File',
  {
    contentAsBase64?: string
  }
>

export type FileV1 = ExtendThing<FileV1Mixin, MediaObject>

export type VCSFileV1 = VCV1Subject<ExpandThing<FileV1>>

export type VCFileV1 = VCV1<VCSFileV1, Type<'FileV1'>>

export const getVCFileV1Context = () => {
  const fileEntry = createContextEntry<FileV1Mixin, MediaObject>({
    type: 'File',
    typeIdBase: 'affSchema',
    fields: {
      contentAsBase64: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCFileV1>({
    type: 'FileV1',
    typeIdBase: 'affSchema',
    entries: [fileEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
