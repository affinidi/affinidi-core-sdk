import { expect } from 'chai'

import MetricsService from '../../../src/services/MetricsService'

import { medicalCredential } from '../../factory/medicalCredential'
import { signedCredential as otherCredential } from '../../factory/signedCredential'

import { EventName } from '@affinidi/affinity-metrics-lib'

const accessApiKey = 'dummyHash'
const metricsUrl = 'https://dummy'

describe('MetricsService', () => {
  const metricsService = new MetricsService({ metricsUrl, accessApiKey: accessApiKey })

  describe('parseVcMetadata', () => {
    const vcType = 'HealthPassportBundleCredentialV1'

    const eventVcSaved = EventName.VC_SAVED
    it(`#parse ${vcType} for ${eventVcSaved} the type-specific metadata`, async () => {
      const metadata = metricsService.parseVcMetadata(medicalCredential, eventVcSaved)
      const resourceNames = []

      for (const entry of metadata.data) {
        const name = entry.resource.resourceType
        resourceNames.push(name)
      }

      expect(resourceNames).not.contain(['Patient'])
      expect(metadata.vcType[1]).to.equal(vcType)
    })

    const eventVcSigned = EventName.VC_SIGNED
    it(`#parse ${vcType} for ${eventVcSigned} only the common metadata`, async () => {
      const metadata = metricsService.parseVcMetadata(medicalCredential, eventVcSigned)

      expect(metadata.vcType[1]).to.equal(vcType)
      expect(metadata.data).to.be.empty
    })

    const otherType = 'NameCredentialPersonV1'

    it(`#parse ${otherType}`, async () => {
      const metadata = metricsService.parseVcMetadata(otherCredential, EventName.VC_SAVED)

      expect(metadata.data).to.be.empty
      expect(metadata.vcType[1]).to.equal(otherType)
    })
  })
})
