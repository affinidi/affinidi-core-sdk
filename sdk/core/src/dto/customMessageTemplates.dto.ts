export class CreateMessageTemplateInput {
  username: string
  template: string
  subject?: string
  htmlTemplate?: string
}
export class DeleteMessageTemplateInput {
  username: string
}
