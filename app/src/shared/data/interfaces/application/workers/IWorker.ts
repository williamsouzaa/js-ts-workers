import { ChildProcess } from 'child_process';
import { TWorkerListenerStructData } from "./IWorkerListener.js";

export interface IWorker<TEntryData> {
  readonly id: number
  readonly name: string
  readonly worker: ChildProcess

  handle(id: number, name: string, pathWorkerFile: string): Promise<void>
  postMessage(structData: TWorkerListenerStructData<TEntryData>, bufferData: any): Promise<void>
}