import os from 'os'
import { E_WORKER_STATE, IWorkerThread } from "../../../interfaces/application/workers/IWorkerThread.js"
import { IWorkerThreadPool } from '../../../interfaces/application/workers/IWorkerThreadPool.js'

export abstract class AWorkerThreadPool<EntryData> implements IWorkerThreadPool<EntryData> {
  public workerThreadsPool: Map<number, IWorkerThread<EntryData>> = new Map()

  constructor(private workerThreadFactory: () => IWorkerThread<EntryData>) {}

  public async init(filePath: `./dist/${string}.js`, turnOnQuantity: number | null = null): Promise<void> {
    if (!turnOnQuantity) {
        const totalCores = os.cpus().length
        turnOnQuantity = totalCores - 1
      }

      for (let i = 0; i < turnOnQuantity; i++) {
        const name = `workerThread${i}`
        const workerThread = this.workerThreadFactory()
        await workerThread.handle(i, name, filePath)
        this.workerThreadsPool.set(i, workerThread)
      }
  }

  public async stopAll(): Promise<void> {
    for(const [_, workerThreadInstance] of this.workerThreadsPool) {
      // child_process uses kill() instead of worker_threads' terminate()
      workerThreadInstance.worker.kill()
      workerThreadInstance.changeStateTo(E_WORKER_STATE.OFFLINE)
      console.log('[LOG][INFO] - WorkerThreadManager - stopAll - sucesso')
    }
  }

  public async stopById(id: number): Promise<void> {
    const workerThreadInstance = this.workerThreadsPool.get(id)
    workerThreadInstance!.worker.kill()
    workerThreadInstance!.changeStateTo(E_WORKER_STATE.OFFLINE)
    console.log('[LOG][INFO] - WorkerThreadManager - stopById - sucesso')
  }

  public allWorkersIsBusy(): boolean {
    for(const [_, workerThread] of this.workerThreadsPool) {
      if (!workerThread.workerIsBusy()) return false
    }
    return true
  }
}

