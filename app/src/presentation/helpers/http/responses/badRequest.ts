import { THttpResponse } from "#src/presentation/interfaces/http/THttpResponse.js";

export function badRequest (error : any | Error = null): THttpResponse {
  return {
    status: 400,
    body: error || 'bad request'
  }
}
