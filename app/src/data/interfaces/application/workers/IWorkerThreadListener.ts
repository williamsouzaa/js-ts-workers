import { EWorkerState } from "./EWorkerState.js"
import { Worker } from 'worker_threads';

export interface IWorkerThreadListener {
  handle(): Promise<void>
}