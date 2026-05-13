import { TPostMessageStrucData } from "../IParentPortWorkerThread.js";

export interface IWorkerThreadSucessEventHandler {
  handle(structData: TPostMessageStrucData): Promise<void>
}
