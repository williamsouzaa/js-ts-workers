import os from 'os'
import { EWorkerState } from "../../../interfaces/application/workers/EWorkerState.js"
import { WorkerThread } from "./WorkerThread.js"
import { IWorkerThreadManager } from '../../../interfaces/application/workers/IWorkerThreadManager.js'
import { IWorkerThread } from '../../../interfaces/application/workers/IWorkerThread.js'
import { Worker, isMainThread, parentPort, workerData, setEnvironmentData, getEnvironmentData } from 'worker_threads';

export class WorkerThreadManager implements IWorkerThreadManager {
  public workerThreadsPool: Map<number, IWorkerThread> = new Map()

  public async init(turnOnQuantity: number | null = null): Promise<void> {
    if (!turnOnQuantity) {
        const totalCores = os.cpus().length
        turnOnQuantity = totalCores - 1
      }

      const fileExtension = import.meta.url.endsWith('.ts') ? '.ts' : '.js';
      const dirName = import.meta.url.endsWith('.ts') ? 'app' : 'dist';

      for (let i = 0; i < turnOnQuantity; i++) {
        const name = `workerThread${i}`
        const worker = new Worker(`./${dirName}/src/data/useCases/application/workers/testWorker${fileExtension}`, {
          workerData: { name, workerId: 1 }
        });

        const workerThread = new WorkerThread()
        await workerThread.handle(i, name, worker)
        this.workerThreadsPool.set(i, workerThread)
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
