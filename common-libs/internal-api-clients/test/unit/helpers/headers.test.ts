'use strict'

import { expect } from 'chai'
import { createHeaders, createAdditionalHeaders } from '../../../src/helpers/headers'

const fakeAccessApiKey = 'fakeAccessApiKey'
const fakeAuthToken = Math.random().toString(36).substring(7)
const fakeSDKVersion = 'fakeSDKVersion'
const fakeRegion = 'fakeRegion'

describe('Headers Helpers', () => {
  it('#createHeaders with SDK version', async () => {
    const headers = createHeaders({
      accessApiKey: fakeAccessApiKey,
      sdkVersion: fakeSDKVersion,
    })

    expect(headers['Accept']).to.eql('application/json')
    expect(headers['Api-Key']).to.eql(fakeAccessApiKey)
    expect(headers['Content-Type']).to.eql('application/json')
    expect(headers['X-SDK-Version']).to.eql(fakeSDKVersion)
  })

  it('#createHeaders without SDK version', async () => {
    const headers = createHeaders({
      accessApiKey: 'fakeAccessApiKey',
    })

    expect(headers['Accept']).to.eql('application/json')
    expect(headers['Api-Key']).to.eql(fakeAccessApiKey)
    expect(headers['Content-Type']).to.eql('application/json')
    expect(headers['X-SDK-Version']).to.eql('unknown')
  })

  it('#getExtendedHeaders', async () => {
    const extendedHeaders = createAdditionalHeaders({
      authorization: fakeAuthToken,
      storageRegion: fakeRegion,
    })

    expect(extendedHeaders['Authorization']).to.eql(fakeAuthToken)
    expect(extendedHeaders['X-DST-REGION']).to.eql(fakeRegion)
  })

  it('#getExtendedHeaders with empty options', async () => {
    const extendedHeaders = createAdditionalHeaders({})

    expect(extendedHeaders['Authorization']).to.be.undefined
    expect(extendedHeaders['X-DST-REGION']).to.be.undefined
  })
})
