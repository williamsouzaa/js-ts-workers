import { TEntryData } from "../../../../domain/useCases/data/TEntryData.js"
import { E_WORKER_PROCESS, E_WORKERS_PROCESS_QUEUE } from "../../../../domain/useCases/names/index.js"


export type TPostMessageStrucData = {
  identifier: E_WORKER_PROCESS,
  queue?: {
    identifier: E_WORKERS_PROCESS_QUEUE
    message: {
      identifier: "mainThread" | "received"
    }
    processPackage: {
      keyGroup: string
      packageIndex: number
    }
  }
  worker?: {
    id: number
  }
  binaryData?: Array<Uint8Array<ArrayBuffer>> | Uint8Array<ArrayBuffer>
  entryData?: TEntryData
}