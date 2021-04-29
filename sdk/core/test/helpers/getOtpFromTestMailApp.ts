let fetch: any

/* istanbul ignore next */
if (!fetch) {
  fetch = require('node-fetch')
}

export class EmailConfiguration {
  public static readonly TESTMAIL_URL = 'https://api.testmail.app'
  public static readonly TESTMAIL_API_KEY = process.env.TESTMAIL_API_KEY
  public static readonly TESTMAIL_NAMESPACE = process.env.TESTMAIL_NS
  public static readonly TESTMAIL_PATH = '/api/json'
}

export interface TestEmail {
  subject: string
  html: string
  text: string
  downloadUrl: string
  from: string
  to: string
  tag: string
  timestamp: number
}

export class TestEmailHelper {
  public static generateEmailForTag = (tag: string): string =>
    `${EmailConfiguration.TESTMAIL_NAMESPACE}.${tag}@inbox.testmail.app`
  public static getEmailsForTag = async (tag: string): Promise<TestEmail[]> => {
    const url = `${EmailConfiguration.TESTMAIL_URL}${EmailConfiguration.TESTMAIL_PATH}?apikey=${EmailConfiguration.TESTMAIL_API_KEY}&namespace=${EmailConfiguration.TESTMAIL_NAMESPACE}&tag=${tag}`
    const request = await fetch(url)
    const data = await request.json()
    const emails = data.emails.map(
      (m: any): TestEmail => {
        const { from, to, subject, html, downloadUrl, tag, timestamp, text } = m
        return { from, to, subject, html, downloadUrl, tag, timestamp, text }
      },
    )
    return emails
  }
  public static extractOpt = async (tag:string) => {
    const [{text, html}] = await TestEmailHelper.getEmailsForTag(tag)
    const matches = (html || text || '').match(/\d{6}/)
    return matches[matches.length - 1]
  }
}
