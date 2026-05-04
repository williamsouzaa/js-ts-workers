import { TPostMessageStrucData } from "./TPostMessageStrucData.js";

export interface IParentPortWorkerThread {
  handle(structData: TPostMessageStrucData): Promise<void>
}