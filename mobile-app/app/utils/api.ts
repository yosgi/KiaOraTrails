
export type LooseObj = {
  [key: string]: any
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface FetchOptions {
  method?: HttpMethod
  payload?: LooseObj
  headers?: LooseObj
}

export class AuthAPI {
  private static endpoint = process.env.NEXT_PUBLIC_SERVER_URL

  private static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static get(url: string, options: FetchOptions = {}, retries = 3) {
    return AuthAPI.client(
      url,
      {
        ...options,
        method: 'GET',
      },
      retries,
    )
  }

  static post(url: string, options: FetchOptions = {}, retries = 3) {
    return AuthAPI.client(
      url,
      {
        ...options,
        method: 'POST',
      },
      retries,
    )
  }

  private static async client(
    url: string,
    options: FetchOptions,
    retries = 3,
    retryDelay = 500,
  ): Promise<any> {
    try {
      const session = {} as any
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      // default token
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session?.accessToken}`
      }

      // Override default token if token given
      if (options?.headers?.token) {
        headers.Authorization = `Bearer ${options.headers?.token}`
      }

      const response = await fetch(`${this.endpoint}${url}`, {
        ...options,
        headers,
        body: options.payload ? JSON.stringify(options.payload) : undefined,
      })

      const contentLength = response?.headers?.get('content-length')
      if (contentLength === '0') return
      const result = await response.json()
      if (result?.error) {
        return console.error(result.error)
      }
      return result
    } catch (e) {
      return console.error(e)
    }
  }
}
