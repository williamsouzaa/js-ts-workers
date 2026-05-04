import { THttpResponse } from "#src/presentation/interfaces/http/THttpResponse.js";

export function internalServerError (error : any | Error = null): THttpResponse {
  return {
    status: 500,
    body: error || 'internal server error'
  }
}
