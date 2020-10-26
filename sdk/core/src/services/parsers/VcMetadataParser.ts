import { VcMetadata } from '@affinidi/affinity-metrics-lib'

import { SignedCredential } from '../../dto/shared.dto'

type CommonVcMetadata = Omit<VcMetadata, 'data'> // anything to data will be overwritten by SpecificVcMetadada.data
type SpecificVcMetadada = { data: any }

class VcMetadataParser {
  // parse vcType-agnostic metadata
  private parseCommon(credential: SignedCredential): CommonVcMetadata {
    const metadata = { vcType: credential.type }
    return metadata
  }

  // parse vcType-specific metadata
  /* eslint-disable-next-line no-unused-vars */
  parseSpecific(credential: SignedCredential): SpecificVcMetadada {
    return { data: {} }
  }

  parse(credential: SignedCredential): VcMetadata {
    const baseMetadata = this.parseCommon(credential)
    const addOnMetadata = this.parseSpecific(credential)
    return { ...baseMetadata, ...addOnMetadata }
  }
}

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

export class VcMetadataParserFactory {
  createParser(vcType: string): VcMetadataParser {
    switch (vcType) {
      case 'HealthPassportBundleCredentialV1': // TODO: can we import this value from vc-data in a modular way?
        return new HealthPassportParser()
      default:
        return new VcMetadataParser()
    }
  }
}
