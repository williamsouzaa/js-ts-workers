import { THttpResponse } from "../../../interfaces/http/THttpResponse.js";

export function tooManyRequests (error : any | Error = null): THttpResponse {
  return {
    status: 429,
    body: error || 'too many requests'
  }
}
