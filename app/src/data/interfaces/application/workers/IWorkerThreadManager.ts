import { IWorkerThread } from "./IWorkerThread.js"

export interface IWorkerThreadManager {
  init(pathFileWorker: string, turnOnQuantity: number | null): Promise<Map<number, IWorkerThread>>
  stopAll(): Promise<void>
  stopById(id: number): Promise<void>
  allWorkersIsBusy(): boolean
}