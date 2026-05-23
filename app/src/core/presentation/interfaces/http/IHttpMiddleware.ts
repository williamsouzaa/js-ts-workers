import { THttpRequest } from './THttpRequest.js'
import { THttpResponse } from './THttpResponse.js'

export interface IHttpMiddleware {
  handle(request: THttpRequest): Promise<THttpResponse>
}
