import { EWorkersProcess, EWorkersProcessQueue } from "../../../../domain/useCases/names/index.js"


export type TPostMessageStrucData = {
  identifier: EWorkersProcess,
  queue?: {
    identifier: EWorkersProcessQueue,
    message: any
  }
  worker?: {
    id: number
  }
  binaryData?: Uint8Array<ArrayBuffer>
  data?: any
}