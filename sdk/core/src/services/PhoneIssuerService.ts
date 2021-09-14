import {
  DefaultApiFp as Api,
  InlineResponse200 as _InitiateResponse,
  InlineResponse2001 as _VerifyResponse,
} from '@affinidi/issuer-phone-twilio-client'
import { profile } from '@affinidi/tools-common'
import { VCPhonePersonV1, VCAccountPersonV1 } from '@affinidi/vc-data'

type Awaited<T> = T extends PromiseLike<infer U> ? U : never
type ApiInitiatePostPromise = ReturnType<ReturnType<typeof Api>['apiInitiatePost']>
type ApiInitiatePostResult = Awaited<ApiInitiatePostPromise>
type AxiosInstance = Parameters<ApiInitiatePostResult>[0]

export type VerifyResponse = Omit<_VerifyResponse, 'vcs'> & {
  vcs: (VCPhonePersonV1 | VCAccountPersonV1)[]
}

export type InitiateResponse = _InitiateResponse

@profile()
export class PhoneIssuerService {
  private readonly basePath: string

  constructor({ basePath }: { basePath: string }) {
    this.basePath = basePath
  }

  private readonly getApi = (apiKey: string) => Api({ apiKey, basePath: this.basePath })

  async initiate({
    apiKey,
    phoneNumber,
    isWhatsAppNumber,
    id,
    holder,
    axios,
  }: {
    apiKey: string
    phoneNumber: string
    isWhatsAppNumber?: boolean
    id: string
    holder: string
    axios?: AxiosInstance
  }): Promise<InitiateResponse> {
    const apicall = await this.getApi(apiKey).apiInitiatePost({
      payload: {
        id,
        holder,
        type: [],
        data: {
          phoneNumber,
          isWhatsAppNumber,
        },
      },
    })
    const result = await apicall(axios, this.basePath)
    return result.data
  }

  async verify({
    apiKey,
    code,
    id,
    holder,
    axios,
  }: {
    apiKey: string
    code: string
    id: string
    holder: string
    axios?: AxiosInstance
  }): Promise<VerifyResponse> {
    const apicall = await this.getApi(apiKey).apiVerifyPost({
      payload: {
        id,
        holder,
        type: [],
        data: { code },
      },
    })
    const result = await apicall(axios, this.basePath)
    return result.data as VerifyResponse
  }
}
