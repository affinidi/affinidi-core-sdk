'use strict'

import { expect } from 'chai'
import { createHeaders, updateHeaders } from '../../../src/helpers/headers'

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

  it('#updateHeaders', async () => {
    let headers = createHeaders({
      accessApiKey: fakeAccessApiKey,
      sdkVersion: fakeSDKVersion,
    })

    headers = updateHeaders(headers, {
      authorization: fakeAuthToken,
      storageRegion: fakeRegion,
    })

    expect(headers['Accept']).to.eql('application/json')
    expect(headers['Api-Key']).to.eql(fakeAccessApiKey)
    expect(headers['Authorization']).to.eql(fakeAuthToken)
    expect(headers['Content-Type']).to.eql('application/json')
    expect(headers['X-SDK-Version']).to.eql(fakeSDKVersion)
    expect(headers['X-DST-REGION']).to.eql(fakeRegion)
  })

  it('#updateHeaders with empty options', async () => {
    let headers = createHeaders({
      accessApiKey: fakeAccessApiKey,
      sdkVersion: fakeSDKVersion,
    })

    headers = updateHeaders(headers, {})

    expect(headers['Accept']).to.eql('application/json')
    expect(headers['Api-Key']).to.eql(fakeAccessApiKey)
    expect(headers['Authorization']).to.be.undefined
    expect(headers['Content-Type']).to.eql('application/json')
    expect(headers['X-SDK-Version']).to.eql(fakeSDKVersion)
    expect(headers['X-DST-REGION']).to.be.undefined
  })
})
