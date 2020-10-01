import { buildVPV1Unsigned } from '@affinidi/vc-common'
import { VCV1 } from '@affinidi/vc-common'

export const buildPresentation = (vcs: VCV1[], holder: string) =>
  buildVPV1Unsigned({
    vcs,
    holder: {
      id: holder,
    },
  })
