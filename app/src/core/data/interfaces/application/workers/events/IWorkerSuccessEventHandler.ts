import { TWorkerListenerStructData } from "../IWorkerListener.js";


export interface IWorkerSuccessEventHandler<TEntryData> {
  handle(structData: TWorkerListenerStructData<TEntryData>): Promise<void>
}
