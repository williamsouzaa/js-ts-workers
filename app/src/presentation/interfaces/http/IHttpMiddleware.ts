import { THttpRequest } from './THttpRequest'
import { THttpResponse } from './THttpResponse'

export interface IHttpMiddleware {
  handle(request: THttpRequest): Promise<THttpResponse>
}