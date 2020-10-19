import { expect } from 'chai'

import MetricsService from '../../../src/services/MetricsService'

const medicalCredential = require('../../factory/medicalCredential')
const otherCredential = require('../../factory/signedCredential') // this is a legacy format

const apiKeyHash = 'dummyHash'
const metricsUrl = 'https://dummy'
const metricsService = new MetricsService({ metricsUrl, apiKey: apiKeyHash })

describe('MetricsService', () => {

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

    const otherType = 'ProofOfNameCredential'
    it(`#parse ${otherType}`, async () => {
      const metadata = metricsService.parseVcMetadata(otherCredential)

      expect(metadata.data).to.be.empty
      expect(metadata.vcType[1]).to.equal(otherType)
    })
  })
})
