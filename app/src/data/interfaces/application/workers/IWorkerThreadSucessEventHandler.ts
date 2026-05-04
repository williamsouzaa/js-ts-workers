import { TPostMessageStrucData } from "./TPostMessageStrucData.js";

export interface IWorkerThreadSucessEventHandler {
  handle(structData: TPostMessageStrucData): Promise<void>
}
