import { THttpResponse } from './THttpResponse.js'
import { THttpRequest } from './THttpRequest.js'

export interface IHttpController {
  handle(request: THttpRequest): Promise<THttpResponse>
}