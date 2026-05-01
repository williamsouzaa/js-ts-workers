import { THttpResponse } from './THttpResponse'
import { THttpRequest } from './THttpRequest'

export interface IHttpController {
  handle(request: THttpRequest): Promise<THttpResponse>
}