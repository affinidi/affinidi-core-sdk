let fetch: any

/* istanbul ignore next */
if (!fetch) {
  fetch = require('node-fetch')
}

export class EmailConfiguration {
  public static readonly TESTMAIL_URL = 'https://api.testmail.app'
  public static readonly TESTMAIL_API_KEY = process.env.TESTMAIL_API_KEY
  public static readonly TESTMAIL_NAMESPACE = process.env.TESTMAIL_NAMESPACE
  public static readonly TESTMAIL_PATH = '/api/json'
}

export class TestEmailHelper {
  public static generateEmailForTag = (tag: string): string =>
    `${EmailConfiguration.TESTMAIL_NAMESPACE}.${tag}@inbox.testmail.app`
  public static getEmailsForTag = async (tag: string): any => {
    const url = `${EmailConfiguration.TESTMAIL_URL}${EmailConfiguration.TESTMAIL_PATH}?apikey=${EmailConfiguration.TESTMAIL_API_KEY}&namespace=${EmailConfiguration.TESTMAIL_NAMESPACE}&tag=${tag}`
    const request = await fetch(url)
    const data = await request.json()
    return data
  }
}
