import { buildVPV1Unsigned } from '@affinidi/vc-common'
import { VCV1 } from '@affinidi/vc-common'

export const buildPresentation = (vcs: VCV1[], holder: string) => {
  return buildVPV1Unsigned({
    id: 'uuid:urn:11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
    vcs,
    holder: {
      id: holder,
    },
  })
}
