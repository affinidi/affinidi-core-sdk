import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { Affinity } from '@affinidi/common'
import { SimpleThing, VCV1, VCV1Subject } from '@affinidi/vc-common'
import { SdkOptions } from '../dto'
import { getOptionsFromEnvironment } from '../shared/getOptionsFromEnvironment'
import { IPlatformCryptographyTools } from '../shared/interfaces'

export class PublicTools {
  private readonly affinidi

  constructor(
    platformCryptographyTools: IPlatformCryptographyTools,
    inputOptions: SdkOptions,
    component: EventComponent,
  ) {
    const {
      accessApiKey,
      basicOptions: { metricsUrl, registryUrl },
    } = getOptionsFromEnvironment(inputOptions)

    this.affinidi = new Affinity(
      {
        apiKey: accessApiKey,
        component,
        metricsUrl,
        registryUrl,
      },
      platformCryptographyTools,
    )
  }

  deriveSegmentProof<TKeys extends string, TData extends SimpleThing & Record<TKeys, unknown>>(
    credential: VCV1<VCV1Subject<TData>>,
    fields: TKeys[],
    didDocument?: any,
  ) {
    return this.affinidi.deriveSegmentProof(credential, fields, didDocument)
  }
}
