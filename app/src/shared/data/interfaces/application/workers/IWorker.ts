import { ChildProcess } from 'child_process';
import { TPostMessageStrucData } from "./IParentPortWorker.js";

export enum E_WORKER_STATE {
  BUSY = 'BUSY',
  IDLE = 'IDLE',
  OFFLINE = 'OFFLINE'
}


export interface IWorker<TEntryData> {
  readonly id: number
  readonly name: string
  readonly state: E_WORKER_STATE
  readonly worker: ChildProcess

  handle(id: number, name: string, pathWorkerFile: string): Promise<void>
  changeStateTo(state: E_WORKER_STATE): void
  workerIsBusy(): boolean
  workerIsOffline(): boolean
  workerIsIdle(): boolean
  postMessage(structData: TPostMessageStrucData<TEntryData>, bufferData: any): Promise<void>

}