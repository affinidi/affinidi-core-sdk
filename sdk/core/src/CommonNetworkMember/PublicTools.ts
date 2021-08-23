import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { Affinity } from '@affinidi/common'
import { SdkOptions } from '../dto'
import { getOptionsFromEnvironment } from '../shared/getOptionsFromEnvironment'
import { IPlatformCryptographyTools } from '../shared/interfaces'

export const createPublicTools = (
  platformCryptographyTools: IPlatformCryptographyTools,
  inputOptions: SdkOptions,
  component: EventComponent,
) => {
  const {
    accessApiKey,
    basicOptions: { metricsUrl, registryUrl },
  } = getOptionsFromEnvironment(inputOptions)

  const affinidi = new Affinity(
    {
      apiKey: accessApiKey,
      component,
      metricsUrl,
      registryUrl,
    },
    platformCryptographyTools,
  )

  return {
    deriveSegmentProof: affinidi.deriveSegmentProof.bind(affinidi),
  }
}
