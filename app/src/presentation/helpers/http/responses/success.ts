import { THttpResponse } from "#src/presentation/interfaces/http/THttpResponse.js";

export function success(data: any | Error = null): THttpResponse {
  return {
    status: 200,
    body: data || 'success'
  }
}
