import { TWorkerListenerStructData } from "../IWorkerListener.js";


export interface IWorkerSucessEventHandler<TEntryData> {
  handle(structData: TWorkerListenerStructData<TEntryData>): Promise<void>
}
