import { EWorkerState } from "./EWorkerState.js"
import { Worker } from 'worker_threads';

export interface IWorkerThread {
  readonly id: number
  readonly name: string
  readonly state: EWorkerState
  readonly worker: Worker

  handle(id: number, name: string, worker: Worker): Promise<void>
  postMessage(structData: object, bufferData: any): void
  changeStateTo(state: EWorkerState): void
  workerIsBusy(): boolean
  workerIsOffline(): boolean
  workerIsIdle(): boolean
}