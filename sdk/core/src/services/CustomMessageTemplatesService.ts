import { STAGING_KEY_STORAGE_URL } from '../_defaultConfig'
import { CreateMessageTemplateInput, DeleteMessageTemplateInput } from '../dto/customMessageTemplates.dto'
import GenericApiService from './GenericApiService'

type ConstructorOptions = {
  keyStorageUrl: string
  accessApiKey: string
}

export class CustomMessageTemplatesService {
  protected readonly _options
  private readonly _serviceBaseUrl: string
  constructor(options: ConstructorOptions) {
    this._options = options
    this._serviceBaseUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL
  }
  async storeTemplate(input: CreateMessageTemplateInput): Promise<void> {
    await GenericApiService.executeByOptions(
      this._options.accessApiKey,
      `${this._serviceBaseUrl}/api/v1/message-templates/storeTemplate`,
      { params: input, method: 'POST' },
    )
  }
  async deleteTemplate(input: DeleteMessageTemplateInput): Promise<void> {
    await GenericApiService.executeByOptions(
      this._options.accessApiKey,
      `${this._serviceBaseUrl}/message-templates/deleteTemplate`,
      { params: input, method: 'DELETE' },
    )
  }
}
