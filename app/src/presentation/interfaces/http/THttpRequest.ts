export type THttpRequest = {
  headers?: any
  params?: any
  body?: any
  query?: any
  files?: any

  ip?: string
  endpoint?: string // localhost:5000/endpoint/id
  route?: string // localhost:5000/endpoint/123
  hostname?: string // localhost
}