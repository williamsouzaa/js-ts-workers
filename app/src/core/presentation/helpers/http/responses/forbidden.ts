import { THttpResponse } from "../../../interfaces/http/THttpResponse.js";

export function forbidden (error : any | Error = null): THttpResponse {
  return {
    status: 403,
    body: error || 'forbidden'
  }
}
