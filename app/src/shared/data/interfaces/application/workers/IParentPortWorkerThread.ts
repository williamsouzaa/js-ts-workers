import { TPackageReference } from "../../../../../modules/fiscalOBligations/domain/contracts/IFiscalObligationsEventsPackage.js"
import { E_WORKER_PROCESS } from "../../../../../modules/fiscalOBligations/domain/names.js"




export type TPostMessageStrucData<TEntryData> = {
  identifier: E_WORKER_PROCESS,
  message: "mainThread" | "received" | "success"
  worker?: { id: number }

  fiscalOBligationsEventsPackage?: { packageReference: TPackageReference }

  binaryData?: Array<Uint8Array<ArrayBuffer>> | Uint8Array<ArrayBuffer>
  entryData?: TEntryData
}

export interface IParentPortWorkerThread<TEntryData> {
  handle(structData: TPostMessageStrucData<TEntryData>): Promise<void>
}