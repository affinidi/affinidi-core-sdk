import { STAGING_KEY_STORAGE_URL } from '../_defaultConfig'
import API from './ApiService'
import { CreateMessageTemplateInput, DeleteMessageTemplateInput } from '../dto/customMessageTemplates.dto'
export type CustomMessageTemplatesServiceOptions = {
  url: string
}
export class CustomMessageTemplatesService {
  protected readonly _options: any
  private readonly _serviceBaseUrl: string
  constructor(options: any) {
    this._options = options
    this._serviceBaseUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL
  }
  async storeTemplate(input: CreateMessageTemplateInput): Promise<void> {
    const url = `${this._serviceBaseUrl}/api/v1/message-templates/storeTemplate`

    const api = new API(null, null, null, this._options)

    await api.execute(null, {
      url,
      params: input,
      method: 'POST',
    })
  }
  async deleteTemplate(input: DeleteMessageTemplateInput): Promise<void> {
    const url = `${this._serviceBaseUrl}/message-templates/deleteTemplate`

    const api = new API(null, null, null, this._options)

    await api.execute(null, {
      url,
      params: input,
      method: 'DELETE',
    })
  }
}
