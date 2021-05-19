import fetch from 'node-fetch'
import { URL } from 'url'

const TESTMAIL_URL = 'https://api.testmail.app'
const TESTMAIL_API_KEY = process.env.TESTMAIL_API_KEY
const TESTMAIL_NAMESPACE = process.env.TESTMAIL_NS
const TESTMAIL_PATH = '/api/json'

export interface TestmailEmail {
  subject: string
  html: string
  text?: string
  downloadUrl: string
  from: string
  to: string
  tag: string
  timestamp: number
}

export class TestmailHelper {
  public static generateEmailForTag = (tag: string): string => `${TESTMAIL_NAMESPACE}.${tag}@inbox.testmail.app`

  public static waitForNewEmail = async (queryTag: string, timestampFrom?: number): Promise<TestmailEmail> => {
    const url = new URL(`${TESTMAIL_URL}${TESTMAIL_PATH}`)
    url.searchParams.append('apikey', TESTMAIL_API_KEY)
    url.searchParams.append('namespace', TESTMAIL_NAMESPACE)
    url.searchParams.append('tag', queryTag)
    url.searchParams.append('livequery', 'true')

    if (timestampFrom) {
      url.searchParams.append('timestamp_from', String(timestampFrom))
    }

    const response = await (await fetch(url)).json()

    const { from, to, subject, html, downloadUrl, tag, timestamp, text } = response.emails[0]
    return { from, to, subject, html, downloadUrl, tag, timestamp, text }
  }

  /** @deprecated */
  public static getEmailsForTag = async (tag: string): Promise<TestmailEmail[]> => {
    const url = `${TESTMAIL_URL}${TESTMAIL_PATH}?apikey=${TESTMAIL_API_KEY}&namespace=${TESTMAIL_NAMESPACE}&tag=${tag}`
    const request = await fetch(url)
    const data = await request.json()
    const emails = data.emails.map(
      (m: any): TestmailEmail => {
        const { from, to, subject, html, downloadUrl, tag, timestamp } = m
        return { from, to, subject, html, downloadUrl, tag, timestamp }
      },
    )
    return emails
  }
}
