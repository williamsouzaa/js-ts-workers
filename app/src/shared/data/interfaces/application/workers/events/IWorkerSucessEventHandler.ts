import { TPostMessageStrucData } from "../IParentPortWorker.js";

export interface IWorkerSucessEventHandler<TEntryData> {
  handle(structData: TPostMessageStrucData<TEntryData>): Promise<void>
}
