import fetch from 'node-fetch'
import { URL } from 'url'
import cryptoRandomString from 'crypto-random-string'

const TESTMAIL_API_URL = 'https://api.testmail.app/api/json'
const TESTMAIL_INBOX_DOMAIN = 'inbox.testmail.app'
const TESTMAIL_API_KEY = process.env.TESTMAIL_API_KEY
const TESTMAIL_NAMESPACE = process.env.TESTMAIL_NS

interface InboxOptions {
  prefix: string
  suffix: string
}

interface Email {
  subject: string
  body: string
}

// NOTE: Don't use this helper for mere email generation,
//       since there are limits for emails sent per month
//       Use generateEmail() instead
export class TestmailInbox {
  private _tag: string
  private _email: string
  private _lastEmailTimestamp: number

  constructor({ prefix, suffix }: InboxOptions) {
    const inboxId = cryptoRandomString({ length: 12 }) // arbitrary length
    this._tag = `${prefix}.${inboxId}.${suffix}`
    this._email = `${TESTMAIL_NAMESPACE}.${this._tag}@${TESTMAIL_INBOX_DOMAIN}`

    // if inbox has already been used, ignore its old emails
    this._lastEmailTimestamp = Date.now() - 60_000
  }

  public async waitForNewEmail(): Promise<Email> {
    const url = new URL(TESTMAIL_API_URL)
    url.searchParams.append('apikey', TESTMAIL_API_KEY)
    url.searchParams.append('namespace', TESTMAIL_NAMESPACE)
    url.searchParams.append('tag', this._tag)
    url.searchParams.append('timestamp_from', String(this._lastEmailTimestamp + 1))
    url.searchParams.append('livequery', 'true')

    const response = await (await fetch(url)).json()
    const { subject, html, text, timestamp } = response.emails[0]

    this._lastEmailTimestamp = timestamp

    return {
      subject,
      body: text || html,
    }
  }

  public get email(): string {
    return this._email
  }
}
