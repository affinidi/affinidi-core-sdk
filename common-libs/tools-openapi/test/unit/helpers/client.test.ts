/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from 'chai'
import nock from 'nock'
import { createClientMethods, createClient } from '../../../src'
import clientHelperTestSpec from '../../factory/clientHelperTestSpec'
import { SdkError } from '@affinidi/tools-common'

const fakeAccessApiKey = 'fakeAccessApiKey'
const fakeAuthToken = Math.random().toString(36).substring(7)
const fakeRegion = 'fakeRegion'
const clientHelperTest = 'fakeInput'

const url = 'http://fake.url'
const ngnixError =
  '<html>\n' +
  '<head><title>413 Request Entity Too Large</title></head>\n' +
  '<body>\n' +
  '<center><h1>413 Request Entity Too Large</h1></center>\n' +
  '<hr><center>nginx/1.17.10</center>\n' +
  '</body>\n' +
  '</html>'

describe('Client Helpers', () => {
  const methods = createClientMethods(clientHelperTestSpec)
  const client = createClient(methods, url, { accessApiKey: fakeAccessApiKey })

  beforeEach(() => {
    nock.cleanAll()
  })

  it('should throw and not parse response body as JSON when content-type text/html (not 200)', async () => {
    nock('http://fake.url/').post('/api/v1/client-helper-test').reply(413, ngnixError, { 'Content-type': 'text/html' })

    try {
      await client.ClientHelperTest({
        authorization: fakeAuthToken,
        storageRegion: fakeRegion,
        params: { clientHelperTest },
      })
    } catch (err) {
      // @ts-ignore
      expect(err.message).to.eql(ngnixError)

      // @ts-ignore
      expect(err.code).to.eql('COR-0')

      // @ts-ignore
      expect(err.httpStatusCode).to.eql(413)
      expect(err instanceof SdkError).to.be.true
    }
  })

  it('should throw and parse response body as JSON when content-type application/json (not 200)', async () => {
    nock('http://fake.url/')
      .post('/api/v1/client-helper-test')
      .reply(
        401,
        { code: 'TST-0', message: '401 test error message', context: {} },
        { 'Content-type': 'application/json' },
      )

    try {
      await client.ClientHelperTest({
        authorization: fakeAuthToken,
        storageRegion: fakeRegion,
        params: { clientHelperTest },
      })
    } catch (err) {
      // @ts-ignore
      expect(err.message).to.eql('401 test error message')

      // @ts-ignore
      expect(err.httpStatusCode).to.eql(401)

      // @ts-ignore
      expect(err.code).to.eql('TST-0')
      expect(err instanceof SdkError).to.be.true
    }
  })

  it('should throw for unexpected content-type (not 200)', async () => {
    nock('http://fake.url/').post('/api/v1/client-helper-test').reply(418, {}, { 'Content-type': 'image/png' })

    try {
      await client.ClientHelperTest({
        authorization: fakeAuthToken,
        storageRegion: fakeRegion,
        params: { clientHelperTest },
      })
    } catch (err) {
      // @ts-ignore
      expect(err.message).to.eql('Content type error.')

      // @ts-ignore
      expect(err.code).to.eql('COR-0')

      // @ts-ignore
      expect(err.httpStatusCode).to.eql(418)
      expect(err instanceof SdkError).to.be.true
    }
  })

  it('should return empty body if content-type not JSON (status 200)', async () => {
    nock('http://fake.url/')
      .post('/api/v1/client-helper-test')
      .reply(200, { context: {} }, { 'Content-type': 'image/png' })

    const response = await client.ClientHelperTest({
      authorization: fakeAuthToken,
      storageRegion: fakeRegion,
      params: { clientHelperTest },
    })

    expect(response.body).to.be.exist
    // @ts-ignore
    expect(response.body.context).to.be.undefined
    expect(response.status).to.eql(200)
  })

  it('should return parsed json body if content-type JSON (status 200)', async () => {
    nock('http://fake.url/')
      .post('/api/v1/client-helper-test')
      .reply(200, { clientHelperTest: 'fakeData' }, { 'Content-type': 'application/json' })

    const response = await client.ClientHelperTest({
      authorization: fakeAuthToken,
      storageRegion: fakeRegion,
      params: { clientHelperTest },
    })

    expect(response.body).to.be.exist
    // @ts-ignore
    expect(response.body.clientHelperTest).to.be.eq('fakeData')
    expect(response.status).to.eql(200)
  })
})
