import { ChildProcess } from 'child_process';
import { TWorkerListenerStructData } from "./IWorkerListener.js";

export enum E_WORKER_STATE {
  BUSY = 'BUSY',
  IDLE = 'IDLE',
  OFFLINE = 'OFFLINE'
}


export interface IWorker<TEntryData> {
  readonly id: number
  readonly name: string
  readonly worker: ChildProcess

  handle(id: number, name: string, pathWorkerFile: string): Promise<void>
  // changeStateTo(state: E_WORKER_STATE): void
  // workerIsBusy(): boolean
  // workerIsOffline(): boolean
  // workerIsIdle(): boolean
  postMessage(structData: TWorkerListenerStructData<TEntryData>, bufferData: any): Promise<void>

}