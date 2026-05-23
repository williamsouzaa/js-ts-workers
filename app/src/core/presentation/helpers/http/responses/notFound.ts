import { THttpResponse } from "../../../interfaces/http/THttpResponse.js";

export function notFound (data: any | Error = null): THttpResponse {
  return {
    status: 404,
    body: data || 'not found'
  }
}
