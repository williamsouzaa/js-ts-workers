import { THttpResponse } from '../../../interfaces/http/THttpResponse'

export function success(data: any | Error = null): THttpResponse {
  return {
    status: 200,
    body: data || 'success'
  }
}
