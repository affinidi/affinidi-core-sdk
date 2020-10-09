import S from 'fluent-schema'
import Ajv from 'ajv'
import { buildVCV1Skeleton, buildVCV1Unsigned } from '@affinidi/vc-common'
import { VCSPhonePersonV1, getVCPhonePersonV1Context } from '@affinidi/vc-data'

import { getInitiateSchema, getVerifySchema } from './schemas'
import { EndpointParamsBase, EndpointRespBase, VerifyRespVCsBase } from './config'

describe('getInitiateSchema', () => {
  let validateBody: Ajv.ValidateFunction
  let validateResponse200: Ajv.ValidateFunction
  let validateResponse400: Ajv.ValidateFunction

  beforeEach(() => {
    const ajv = new Ajv({ allErrors: true })
    const {
      body,
      response: { 200: response200, 400: response400 },
    } = getInitiateSchema({
      payloadDataSchema: S.object()
        .prop('phoneNumber', S.string())
        .prop('isWhatsAppNumber', S.boolean())
        .required(['phoneNumber']),
    })
    validateBody = ajv.compile(body.valueOf())
    validateResponse200 = ajv.compile(response200.valueOf())
    validateResponse400 = ajv.compile(response400.valueOf())
  })

  it('validates a body', () => {
    const payload: EndpointParamsBase = {
      id: '1234',
      holder: '1234',
      type: ['type'],
      data: {
        phoneNumber: '+1 555 555 5555',
        isWhatsAppNumber: true,
      },
    }

    const valid = validateBody({ payload })

    expect(valid).toBeTruthy()
  })

  describe('fails when body is invalid', () => {
    it('when no id is set', () => {
      const payload = {
        holder: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when id is invalid', () => {
      const payload = {
        id: 1234,
        holder: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when no holder is set', () => {
      const payload = {
        id: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when holder is invalid', () => {
      const payload = {
        id: '1234',
        holder: 1234,
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when no type is set', () => {
      const payload = {
        id: '1234',
        holder: '1234',
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when type is invalid', () => {
      const payload = {
        id: '1234',
        holder: '1234',
        type: 'type',
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when no data is set', () => {
      const payload = {
        id: '1234',
        holder: '1234',
        type: ['type'],
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when data is invalid', () => {
      const payload = {
        id: '1234',
        holder: '1234',
        type: ['type'],
        data: {},
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })
  })

  it('validates a 200 response', () => {
    const response: EndpointRespBase = {
      success: true,
      status: 'ready',
      id: '1234',
      type: ['type'],
      data: {
        phoneNumber: '+1 555 555 5555',
        isWhatsAppNumber: true,
      },
    }

    const valid = validateResponse200(response)

    expect(valid).toBeTruthy()
  })

  describe('fails when a 200 response is invalid', () => {
    it('when no success is set', () => {
      const response = {
        status: 'ready',
        id: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when success is invalid', () => {
      const response = {
        success: false,
        status: 'ready',
        id: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when no status is set', () => {
      const response = {
        success: true,
        id: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when status is invalid', () => {
      const response = {
        success: true,
        status: 1234,
        id: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when no id is set', () => {
      const response = {
        success: true,
        status: 'ready',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when id is invalid', () => {
      const response = {
        success: true,
        status: 'ready',
        id: 1234,
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when no type is set', () => {
      const response = {
        success: true,
        status: 'ready',
        id: '1234',
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when type is invalid', () => {
      const response = {
        success: true,
        status: 'ready',
        id: '1234',
        type: 'type',
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when no data is set', () => {
      const response = {
        success: true,
        status: 'ready',
        id: '1234',
        type: ['type'],
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when data is invalid', () => {
      const response = {
        success: true,
        status: 'ready',
        id: '1234',
        type: ['type'],
        data: {},
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })
  })

  it('validates a 400 response', () => {
    const response: EndpointRespBase = {
      success: false,
      status: 'failed',
      id: '1234',
      type: ['type'],
      data: {
        phoneNumber: '+1 555 555 5555',
        isWhatsAppNumber: true,
      },
    }

    const valid = validateResponse400(response)

    expect(valid).toBeTruthy()
  })

  describe('fails when a 400 response is invalid', () => {
    it('when no success is set', () => {
      const response = {
        status: 'failed',
        id: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when success is invalid', () => {
      const response = {
        success: true,
        status: 'failed',
        id: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when no status is set', () => {
      const response = {
        success: true,
        id: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when status is invalid', () => {
      const response = {
        success: true,
        status: 1234,
        id: '1234',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when no id is set', () => {
      const response = {
        success: true,
        status: 'failed',
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when id is invalid', () => {
      const response = {
        success: true,
        status: 'failed',
        id: 1234,
        type: ['type'],
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when no type is set', () => {
      const response = {
        success: true,
        status: 'failed',
        id: '1234',
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when type is invalid', () => {
      const response = {
        success: true,
        status: 'failed',
        id: '1234',
        type: 'type',
        data: {
          phoneNumber: '+1 555 555 5555',
          isWhatsAppNumber: true,
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when no data is set', () => {
      const response = {
        success: true,
        status: 'failed',
        id: '1234',
        type: ['type'],
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when data is invalid', () => {
      const response = {
        success: true,
        status: 'failed',
        id: '1234',
        type: ['type'],
        data: {},
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })
  })
})

describe('getVerifySchema', () => {
  let validateBody: Ajv.ValidateFunction
  let validateResponse200: Ajv.ValidateFunction
  let validateResponse400: Ajv.ValidateFunction

  const vcs = [
    buildVCV1Unsigned({
      skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
        id: 'absoluteUri:1234',
        credentialSubject: {
          data: {
            '@type': ['Person', 'PersonE', 'PhonePerson'],
            telephone: '+1 555 555 5555',
          },
        },
        holder: { id: 'did:method:1234' },
        type: 'PhoneCredentialPersonV1',
        context: getVCPhonePersonV1Context(),
      }),
      issuanceDate: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      revocation: {
        id: 'did:method:1234',
      },
    }),
  ]

  beforeEach(() => {
    const ajv = new Ajv({ allErrors: true })
    const {
      body,
      response: { 200: response200, 400: response400 },
    } = getVerifySchema({
      payloadDataSchema: S.object().prop('code', S.string()).required(['code']),
      credentialSubjectDataSchema: S.object()
        .prop('@type', S.array().items(S.string()))
        .prop('telephone', S.string())
        .required(['@type', 'telephone']),
    })
    validateBody = ajv.compile(body.valueOf())
    validateResponse200 = ajv.compile(response200.valueOf())
    validateResponse400 = ajv.compile(response400.valueOf())
  })

  it('validates a body', () => {
    const payload: EndpointParamsBase = {
      id: '1234',
      holder: '1234',
      type: ['type'],
      data: {
        code: '123456',
      },
    }

    const valid = validateBody({ payload })

    expect(valid).toBeTruthy()
  })

  describe('fails when body is invalid', () => {
    it('when no id is set', () => {
      const payload = {
        holder: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when id is invalid', () => {
      const payload = {
        id: 1234,
        holder: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when no holder is set', () => {
      const payload = {
        id: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when holder is invalid', () => {
      const payload = {
        id: '1234',
        holder: 1234,
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when no type is set', () => {
      const payload = {
        id: '1234',
        holder: '1234',
        data: {
          code: '123456',
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when type is invalid', () => {
      const payload = {
        id: '1234',
        holder: '1234',
        type: 'type',
        data: {
          code: '123456',
        },
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when no data is set', () => {
      const payload = {
        id: '1234',
        holder: '1234',
        type: ['type'],
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })

    it('when data is invalid', () => {
      const payload = {
        id: '1234',
        holder: '1234',
        type: ['type'],
        data: {},
      }

      const valid = validateBody({ payload })

      expect(valid).toBeFalsy()
    })
  })

  it('validates a 200 response', () => {
    const response: VerifyRespVCsBase<VCSPhonePersonV1> = {
      success: true,
      status: 'ready',
      id: '1234',
      type: ['type'],
      data: {
        code: '123456',
      },
      vcs,
    }

    const valid = validateResponse200(response)

    expect(valid).toBeTruthy()
  })

  it('validates a 200 response, with an array of credentialSubjects', () => {
    const response: VerifyRespVCsBase<VCSPhonePersonV1[]> = {
      success: true,
      status: 'ready',
      id: '1234',
      type: ['type'],
      data: {
        code: '123456',
      },
      vcs: [
        buildVCV1Unsigned({
          skeleton: buildVCV1Skeleton<VCSPhonePersonV1[]>({
            id: 'absoluteUri:1234',
            credentialSubject: [
              {
                data: {
                  '@type': ['Person', 'PersonE', 'PhonePerson'],
                  telephone: '+1 555 555 5555',
                },
              },
            ],
            holder: { id: 'did:method:1234' },
            type: 'PhoneCredentialPersonV1',
            context: getVCPhonePersonV1Context(),
          }),
          issuanceDate: new Date().toISOString(),
          revocation: {
            id: 'did:method:1234',
          },
        }),
      ],
    }

    const valid = validateResponse200(response)

    expect(valid).toBeTruthy()
  })

  it('validates a 200 response, without an exiration date', () => {
    const vc = {
      ...vcs[0],
      expirationDate: undefined,
    }
    const response: VerifyRespVCsBase<VCSPhonePersonV1> = {
      success: true,
      status: 'ready',
      id: '1234',
      type: ['type'],
      data: {
        code: '123456',
      },
      vcs: [vc],
    }

    const valid = validateResponse200(response)

    expect(valid).toBeTruthy()
  })

  it('validates a 200 response, without a revocation', () => {
    const vc = {
      ...vcs[0],
      revocation: undefined,
    }
    const response: VerifyRespVCsBase<VCSPhonePersonV1> = {
      success: true,
      status: 'ready',
      id: '1234',
      type: ['type'],
      data: {
        code: '123456',
      },
      vcs: [vc],
    }

    const valid = validateResponse200(response)

    expect(valid).toBeTruthy()
  })

  describe('fails when a 200 response is invalid', () => {
    it('when no success is set', () => {
      const response = {
        status: 'ready',
        id: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
        vcs,
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when success is invalid', () => {
      const response = {
        success: false,
        status: 'ready',
        id: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
        vcs,
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when no status is set', () => {
      const response = {
        success: true,
        id: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
        vcs,
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when status is invalid', () => {
      const response = {
        success: true,
        status: 1234,
        id: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
        vcs,
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when no id is set', () => {
      const response = {
        success: true,
        status: 'ready',
        type: ['type'],
        data: {
          code: '123456',
        },
        vcs,
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when id is invalid', () => {
      const response = {
        success: true,
        status: 'ready',
        id: 1234,
        type: ['type'],
        data: {
          code: '123456',
        },
        vcs,
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when no type is set', () => {
      const response = {
        success: true,
        status: 'ready',
        id: '1234',
        data: {
          code: '123456',
        },
        vcs,
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when type is invalid', () => {
      const response = {
        success: true,
        status: 'ready',
        id: '1234',
        type: 'type',
        data: {
          code: '123456',
        },
        vcs,
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when no data is set', () => {
      const response = {
        success: true,
        status: 'ready',
        id: '1234',
        type: ['type'],
        vcs,
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when data is invalid', () => {
      const response = {
        success: true,
        status: 'ready',
        id: '1234',
        type: ['type'],
        data: {},
        vcs,
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    it('when no vcs is set', () => {
      const response = {
        success: true,
        status: 'ready',
        id: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateResponse200(response)

      expect(valid).toBeFalsy()
    })

    describe('when vcs is invalid', () => {
      it('when vcs is not an array', () => {
        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: vcs[0],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's @context is not set", () => {
        const vc = {
          ...vcs[0],
          '@context': undefined,
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's @context is not valid", () => {
        const vc = {
          ...vcs[0],
          '@context': 'https://example.come',
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's id is not set", () => {
        const vc = {
          ...vcs[0],
          id: undefined,
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's id is not valid", () => {
        const vc = {
          ...vcs[0],
          id: 1234,
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's type is not set", () => {
        const vc = {
          ...vcs[0],
          type: undefined,
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's type is not valid", () => {
        const vc = {
          ...vcs[0],
          type: 'type',
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's holder is not set", () => {
        const vc = {
          ...vcs[0],
          holder: undefined,
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's holder is not valid", () => {
        const vc = {
          ...vcs[0],
          holder: 'holder',
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's credentialSubject is not set", () => {
        const vc = {
          ...vcs[0],
          credentialSubject: undefined,
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's credentialSubject is not valid", () => {
        const vc = {
          ...vcs[0],
          credentialSubject: {},
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's issuanceDate is not set", () => {
        const vc = {
          ...vcs[0],
          issuanceDate: undefined,
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's issuanceDate is not valid", () => {
        const vc = {
          ...vcs[0],
          issuanceDate: '1234',
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's expirationDate is not valid", () => {
        const vc = {
          ...vcs[0],
          expirationDate: '1234',
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })

      it("when vcs's revocation is not valid", () => {
        const vc = {
          ...vcs[0],
          revocation: {},
        }

        const response = {
          success: true,
          status: 'ready',
          id: '1234',
          type: ['type'],
          data: {
            code: '123456',
          },
          vcs: [vc],
        }

        const valid = validateResponse200(response)

        expect(valid).toBeFalsy()
      })
    })
  })

  it('validates a 400 response', () => {
    const response: EndpointRespBase = {
      success: false,
      status: 'failed',
      id: '1234',
      type: ['type'],
      data: {
        code: '123456',
      },
    }

    const valid = validateResponse400(response)

    expect(valid).toBeTruthy()
  })

  describe('fails when a 400 response is invalid', () => {
    it('when no success is set', () => {
      const response = {
        status: 'failed',
        id: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when success is invalid', () => {
      const response = {
        success: true,
        status: 'failed',
        id: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when no status is set', () => {
      const response = {
        success: true,
        id: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when status is invalid', () => {
      const response = {
        success: true,
        status: 1234,
        id: '1234',
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when no id is set', () => {
      const response = {
        success: true,
        status: 'failed',
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when id is invalid', () => {
      const response = {
        success: true,
        status: 'failed',
        id: 1234,
        type: ['type'],
        data: {
          code: '123456',
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when no type is set', () => {
      const response = {
        success: true,
        status: 'failed',
        id: '1234',
        data: {
          code: '123456',
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when type is invalid', () => {
      const response = {
        success: true,
        status: 'failed',
        id: '1234',
        type: 'type',
        data: {
          code: '123456',
        },
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when no data is set', () => {
      const response = {
        success: true,
        status: 'failed',
        id: '1234',
        type: ['type'],
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })

    it('when data is invalid', () => {
      const response = {
        success: true,
        status: 'failed',
        id: '1234',
        type: ['type'],
        data: {},
      }

      const valid = validateResponse400(response)

      expect(valid).toBeFalsy()
    })
  })
})
