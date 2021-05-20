import fetch from 'node-fetch'
import { URL } from 'url'

const TESTMAIL_API_URL = 'https://api.testmail.app/api/json'
const TESTMAIL_INBOX_DOMAIN = 'inbox.testmail.app'
const TESTMAIL_API_KEY = process.env.TESTMAIL_API_KEY
const TESTMAIL_NAMESPACE = process.env.TESTMAIL_NS

interface TestmailEmail {
  subject: string
  html?: string
  text?: string
}

// NOTE: Don't use this helper for mere email generation,
//       since there are limits for emails sent per month
//       Use generateEmail() for random email generation
export class TestmailHelper {
  public static generateEmailForTag = (tag: string): string => `${TESTMAIL_NAMESPACE}.${tag}@${TESTMAIL_INBOX_DOMAIN}`

  public static waitForNewEmail = async (tag: string, timestampFrom: number): Promise<TestmailEmail> => {
    const url = new URL(TESTMAIL_API_URL)
    url.searchParams.append('apikey', TESTMAIL_API_KEY)
    url.searchParams.append('namespace', TESTMAIL_NAMESPACE)
    url.searchParams.append('tag', tag)
    url.searchParams.append('timestamp_from', String(timestampFrom))
    url.searchParams.append('livequery', 'true')

    const response = await (await fetch(url)).json()

    const { subject, html, text } = response.emails[0]
    return { subject, html, text }
  }
}
