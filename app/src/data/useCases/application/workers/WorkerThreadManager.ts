import os from 'os'
import { EWorkerState } from "../../../interfaces/application/workers/EWorkerState.js"
import { WorkerThread } from "./WorkerThread.js"
import { IWorkerThreadManager } from '../../../interfaces/application/workers/IWorkerThreadManager.js'
import { IWorkerThread } from '../../../interfaces/application/workers/IWorkerThread.js'

export class WorkerThreadManager implements IWorkerThreadManager {
  public workerThreadsPool: Map<number, IWorkerThread> = new Map()

  public async init(pathFileWorker: string, turnOnQuantity: number | null = null): Promise<void> {
    if (!turnOnQuantity) {
        const totalCores = os.cpus().length
        turnOnQuantity = totalCores - 1
      }

      for (let i = 1; i <= turnOnQuantity; i++) {
        const worker = new WorkerThread()
        await worker.handle(i, `workerThread${i}`, pathFileWorker)
        this.workerThreadsPool.set(i, worker)
      }
  }

  public async stopAll(): Promise<void> {
    for(const [_, workerThreadInstance] of this.workerThreadsPool) {
      workerThreadInstance.worker.terminate()
      workerThreadInstance.changeStateTo(EWorkerState.OFFLINE)
      console.log('[LOG][INFO] - WorkerThreadManager - stopAll - sucesso')
    }
  }

  public async stopById(id: number): Promise<void> {
    const workerThreadInstance = this.workerThreadsPool.get(id)
    workerThreadInstance!.worker.terminate()
    workerThreadInstance!.changeStateTo(EWorkerState.OFFLINE)
    console.log('[LOG][INFO] - WorkerThreadManager - stopById - sucesso')
  }

  public allWorkersIsBusy(): boolean {
    for(const [_, workerThread] of this.workerThreadsPool) {
      if (!workerThread.workerIsBusy()) return false
    }
    return true
  }
}
