import { EWorkerState } from "./EWorkerState.js"
import { Worker } from 'worker_threads';
import { TPostMessageStrucData } from "./IParentPortWorkerThread.js";

export interface IWorkerThread {
  readonly id: number
  readonly name: string
  readonly state: EWorkerState
  readonly worker: Worker

  handle(id: number, name: string, pathWorkerFile: string): Promise<void>
  changeStateTo(state: EWorkerState): void
  workerIsBusy(): boolean
  workerIsOffline(): boolean
  workerIsIdle(): boolean
  postMessage(structData: TPostMessageStrucData, bufferData: any): Promise<void>

}