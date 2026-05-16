import { IWorkerThread } from "./IWorkerThread.js"

export interface IWorkerThreadPool<TEntryData> {
  workerThreadsPool: Map<number, IWorkerThread<TEntryData>>
  init(filePath: `./dist/${string}.js`, turnOnQuantity: number | null): Promise<void>
  stopAll(): Promise<void>
  stopById(id: number): Promise<void>
  allWorkersIsBusy(): boolean
}