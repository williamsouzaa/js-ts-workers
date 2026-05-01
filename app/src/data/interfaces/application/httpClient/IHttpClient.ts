export type THttpClient = {
  baseUrl?: string
  endpoint: string
  headers?: any
  params?: any
  data?: any
  timeout?: number
}

export type THttpClientResponse = {
  data?: any
  status?: number
  statusText?: any
  headers?: any
  config?: any
}

export interface IHttpClient {
  get(data: THttpClient): Promise<THttpClientResponse>

  post(data: THttpClient): Promise<THttpClientResponse>

  put(data: THttpClient): Promise<THttpClientResponse>

  delete(data: THttpClient): Promise<THttpClientResponse>
}
