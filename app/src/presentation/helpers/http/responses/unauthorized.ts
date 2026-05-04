import { THttpResponse } from "#src/presentation/interfaces/http/THttpResponse.js";

export function unauthorized (error : any | Error = null): THttpResponse {
  return {
    status: 401,
    body: error || 'unauthorized'
  }
}
