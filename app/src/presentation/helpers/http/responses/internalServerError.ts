import { THttpResponse } from '../../../interfaces/http/THttpResponse'

export function internalServerError (error : any | Error = null): THttpResponse {
  return {
    status: 500,
    body: error || 'internal server error'
  }
}
