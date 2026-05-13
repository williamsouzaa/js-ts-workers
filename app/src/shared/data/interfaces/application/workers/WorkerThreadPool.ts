import { IWorkerThread } from "./IWorkerThread.js"

export interface IWorkerThreadPool {
  workerThreadsPool: Map<number, IWorkerThread>
  init(filePath: `./dist/${string}.js`, turnOnQuantity: number | null): Promise<void>
  stopAll(): Promise<void>
  stopById(id: number): Promise<void>
  allWorkersIsBusy(): boolean
}