import { TPostMessageStrucData } from "../IParentPortWorkerThread.js";

export interface IWorkerThreadSucessEventHandler<TEntryData> {
  handle(structData: TPostMessageStrucData<TEntryData>): Promise<void>
}
