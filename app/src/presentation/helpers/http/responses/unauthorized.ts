import { THttpResponse } from '../../../interfaces/http/THttpResponse'

export function unauthorized (error : any | Error = null): THttpResponse {
  return {
    status: 401,
    body: error || 'unauthorized'
  }
}
