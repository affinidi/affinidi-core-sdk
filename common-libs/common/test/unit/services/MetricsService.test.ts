import { expect } from 'chai'

import MetricsService from '../../../src/services/MetricsService'

import { medicalCredential } from '../../factory/medicalCredential'
import { signedCredential as otherCredential } from '../../factory/signedCredential'

const accessApiKeyHash = 'dummyHash'
const metricsUrl = 'https://dummy'

describe('MetricsService', () => {
  const metricsService = new MetricsService({ metricsUrl, accessApiKey: accessApiKeyHash })

  describe('parseVcMetadata', () => {
    const vcType = 'HealthPassportBundleCredentialV1'

    it(`#parse ${vcType}`, async () => {
      const metadata = metricsService.parseVcMetadata(medicalCredential)
      const resourceNames = []

      for (const entry of metadata.data) {
        const name = entry.resource.resourceType
        resourceNames.push(name)
      }

      expect(resourceNames).not.contain(['Patient'])
      expect(metadata.vcType[1]).to.equal(vcType)
    })

    const otherType = 'NameCredentialPersonV1'

    it(`#parse ${otherType}`, async () => {
      const metadata = metricsService.parseVcMetadata(otherCredential)

      expect(metadata.data).to.be.empty
      expect(metadata.vcType[1]).to.equal(otherType)
    })
  })
})
