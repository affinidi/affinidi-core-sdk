'use strict'

import { expect } from 'chai'
import JwtService from '../../../src/services/JwtService'

const token =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2' +
  'VuIjp7ImNyZWRlbnRpYWxSZXF1aXJlbWVudHMiOlt7InR5cGUiOlsiQ3JlZGVudGlhbCIsIlB' +
  'yb2ZpbGVDcmVkZW50aWFsIl19XSwiY2FsbGJhY2tVUkwiOiJodHRwczovL2FwaS5kZXYuYWZm' +
  'aW5pdHktcHJvamVjdC5vcmcifSwidHlwIjoiY3JlZGVudGlhbFJlcXVlc3QiLCJpYXQiOjE1O' +
  'DEwNjI4ODg1OTQsImV4cCI6MTU4MTA2NjQ4ODU5NCwianRpIjoiNDE2YzQ3ZDcwZjc5ZDdkYi' +
  'IsImlzcyI6ImRpZDpqb2xvOjA4MjZiNmU0NmIzZGY1NWMyOWY1MmIyMjIyMWRhYzgyZjU5Njh' +
  'mYzdmNDkxYTJhYzQ3NGEzYWQ5Y2Q4MGVlY2Qja2V5cy0xIn0.e35eb6cf513540a7ebd4f3f0' +
  '7e472cf2764c9996a6c794018cbd9cc6934aa03228d4c61e765d159cd4496775301438b33' +
  '1136b05029b5339305b33f1bad3efa5'

const didFromToken = 'did:jolo:0826b6e46b3df55c29f52b22221dac82f5968fc7f491a2ac474a3ad9cd80eecd'

describe('JwtService', () => {
  it('#getDidFromToken', async () => {
    const did = JwtService.getDidFromToken(token)

    expect(did).to.exist
    expect(did).to.be.equal(didFromToken)
  })

  it('#fromJWT', async () => {
    const object = JwtService.fromJWT(token)

    expect(object).to.exist
    expect(object.payload).to.exist
  })

  describe('#buildJWTInteractionToken', () => {
    const interactionToken = {}
    const typ = 'randomTyp'

    it('should work without receivedToken', async () => {
      const jwtObject = await JwtService.buildJWTInteractionToken(interactionToken, typ, null)

      expect(jwtObject).to.exist
      expect(jwtObject.payload).to.exist
      expect(jwtObject.payload.interactionToken).to.eq(interactionToken)
      expect(jwtObject.payload.typ).to.eq(typ)
      expect(jwtObject.payload.jti).to.exist
    })

    it('should propagate the jti and issuer of received token', async () => {
      const differentIssuers = [
        { iss: 'did:test:received-token-issuer#primary', expectedAud: 'did:test:received-token-issuer' },
        { iss: 'did:test:received-token-issuer', expectedAud: 'did:test:received-token-issuer' },
      ]

      for (const { iss, expectedAud } of differentIssuers) {
        const jti = 'jti'
        const receivedToken = { payload: { jti, iss } }

        const jwtObject = await JwtService.buildJWTInteractionToken(interactionToken, typ, receivedToken)

        expect(jwtObject).to.exist
        expect(jwtObject.payload).to.exist
        expect(jwtObject.payload.interactionToken).to.eq(interactionToken)
        expect(jwtObject.payload.typ).to.eq(typ)
        expect(jwtObject.payload.jti).to.eq(jti)
        expect(jwtObject.payload.aud).to.eq(expectedAud)
      }
    })
  })
})
