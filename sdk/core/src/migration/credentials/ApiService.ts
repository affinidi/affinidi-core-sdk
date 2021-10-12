interface FETCH_OPTIONS {
  method: string
  headers: any
  body?: string
}

const bodyRequiredMethods = ['POST', 'PATCH', 'PUT']

export default class ApiService {
  private readonly baseUrl: string
  private readonly headers: any

  constructor(baseUrl: string, headers: any) {
    this.baseUrl = baseUrl
    this.headers = headers
  }

  async execute(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    url?: string,
    bodyParams?: any,
    headers?: any,
  ): Promise<any> | never {
    const request: FETCH_OPTIONS = {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
        ...this.headers,
      },
    }

    if (bodyRequiredMethods.includes(method)) {
      if (!bodyParams) {
        return Error(`bodyParams argument is required for ${method} method.`)
      }

      request.body = JSON.stringify(bodyParams, null, 2)
    }

    const fullUrl = url ? `${this.baseUrl}/${url}` : this.baseUrl
    const response = await fetch(fullUrl, request)
    const { status } = response
    let jsonResponse
    if (status.toString().startsWith('2')) {
      jsonResponse = await response.json()
    } else {
      const error = await response.json()

      throw new Error('unknown response: ' + JSON.stringify(error))
    }

    return jsonResponse
  }
}
