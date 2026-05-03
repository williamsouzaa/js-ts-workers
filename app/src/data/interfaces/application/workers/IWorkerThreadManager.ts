import { IWorkerThread } from "./IWorkerThread.js"

export interface IWorkerThreadManager {
  workerThreadsPool: Map<number, IWorkerThread>

  init(pathFileWorker: string, turnOnQuantity: number | null): Promise<void>
  stopAll(): Promise<void>
  stopById(id: number): Promise<void>
  allWorkersIsBusy(): boolean
}