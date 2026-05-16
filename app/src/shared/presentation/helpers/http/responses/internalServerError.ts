import { THttpResponse } from "../../../interfaces/http/THttpResponse.js";

export function internalServerError (error : any | Error = null): THttpResponse {
  return {
    status: 500,
    body: error || 'internal server error'
  }
}
