import { profile } from '@affinidi/common'
import { metrics, EventComponent, VcMetadata } from '@affinidi/affinity-metrics-lib'

import { MetricsEvent, MetricsServiceOptions, SignedCredential } from '../dto/shared.dto'

export type CommonVcMetadata = Omit<VcMetadata, 'data'>  // anything to data will be overwritten by SpecificVcMetadada.data
export type SpecificVcMetadada = { data: any }

class VcMetadataParser {

  // parse vcType-agnostic metadata
  private parseCommon(credential: any): CommonVcMetadata {
    const metadata = { vcType: credential.type }
    return metadata
  }

  // parse vcType-specific metadata
  parseSpecific(credential: any): SpecificVcMetadada {
    return { data: {} }
  }

  parse(credential: any): any {
    const baseMetadata = this.parseCommon(credential)
    const addOnMetadata = this.parseSpecific(credential)
    return {...baseMetadata, ...addOnMetadata}
  }
}

// TODO: move to a single file for all vcType-specific parsers?
class HealthPassportParser extends VcMetadataParser {
  parseSpecific(credential: any): SpecificVcMetadada {
    const targetResources = ['Specimen', 'Observation', 'Organization']
    const entriesIn = credential.credentialSubject.data.fhirBundle.entry
    const entriesOut = entriesIn.filter(function (entry: any) {
      return targetResources.includes(entry.resource.resourceType)
    })
    return { data: entriesOut }
  }
}

class VcMetadataParserFactory {
  createParser(vcType: string): VcMetadataParser {
    switch (vcType) {
      case 'HealthPassportBundleCredentialV1': // TODO: can we import this value from vc-data in a modular way?
        return new HealthPassportParser()
      default:
        return new VcMetadataParser()
    }
  }
}

@profile()
export default class MetricsService {
  _apiKey: string
  _metricsUrl: string
  _vcMetadataParserFactory: VcMetadataParserFactory

  constructor(options: MetricsServiceOptions) {
    this._apiKey = options.apiKey
    this._metricsUrl = options.metricsUrl
    this._vcMetadataParserFactory = new VcMetadataParserFactory()
  }

  send(event: MetricsEvent): void {
    const component = EventComponent.AffinityBrowserExpoSDK

    const metricsEvent = Object.assign({}, event, { component })

    metrics.send(metricsEvent, this._apiKey, this._metricsUrl)
  }

  parseVcMetadata(credential: SignedCredential): VcMetadata {
    const vcMetadataParser = this._vcMetadataParserFactory.createParser(credential.type[1])
    const metadata = vcMetadataParser.parse(credential)
    return metadata
  }
}
