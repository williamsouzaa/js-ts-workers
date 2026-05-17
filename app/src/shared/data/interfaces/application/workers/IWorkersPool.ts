import { IWorker } from "./IWorker.js"

export interface IWorkersPool<TEntryData> {
  workerThreadsPool: Map<number, IWorker<TEntryData>>
  init(filePath: `./dist/${string}.js`, turnOnQuantity: number | null): Promise<void>
  stopAll(): Promise<void>
  stopById(id: number): Promise<void>
  allWorkersIsBusy(): boolean
}