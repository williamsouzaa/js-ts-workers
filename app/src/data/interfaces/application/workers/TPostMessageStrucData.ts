import { E_WORKER_PROCESS, E_WORKERS_PROCESS_QUEUE } from "../../../../domain/useCases/names/index.js"


export type TPostMessageStrucData = {
  identifier: E_WORKER_PROCESS,
  queue?: {
    identifier: E_WORKERS_PROCESS_QUEUE,
    message: any
  }
  worker?: {
    id: number
  }
  binaryData?: Uint8Array<ArrayBuffer>
  data?: any
}