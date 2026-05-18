import { TPackageReference } from "../../../../domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { E_WORKER_PROCESS } from "../../../../domain/fiscalObligations/names.js"



export type TWorkerListenerStructData<TEntryData> = {
  identifier: E_WORKER_PROCESS,
  message: "mainThread" | "received" | "processed"
  worker?: { id: number }

  fiscalOBligationsEventsPackage?: { packageReference: TPackageReference }

  binaryData?: Array<Uint8Array<ArrayBuffer>> | Uint8Array<ArrayBuffer>
  entryData?: TEntryData
}

export interface IWorkerListener<TEntryData> {
  handle(structData: TWorkerListenerStructData<TEntryData>): Promise<void>
}