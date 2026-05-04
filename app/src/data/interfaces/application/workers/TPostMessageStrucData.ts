export type TPostMessageStrucData = {
  identifier: string,
  queue?: {
    identifier: string,
    message: any
  }
  worker?: {
    id: number
  }
  binaryData?: Uint8Array<ArrayBuffer>
  data?: any
}