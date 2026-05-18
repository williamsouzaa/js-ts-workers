import os from 'os'
import { E_WORKER_STATE, IWorker } from "../../../interfaces/application/workers/IWorker.js"
import { IWorkersPool } from '../../../interfaces/application/workers/IWorkersPool.js'


export abstract class AWorkersPool<EntryData> implements IWorkersPool<EntryData> {
  public workerThreadsPool: Map<number, IWorker<EntryData>> = new Map()

  constructor(private workerThreadFactory: () => IWorker<EntryData>) {}

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
      workerThreadInstance.worker.kill()
      console.log('[LOG][INFO] - WorkerManager - stopAll - sucesso')
    }
  }

  public async stopById(id: number): Promise<void> {
    const workerThreadInstance = this.workerThreadsPool.get(id)
    workerThreadInstance!.worker.kill()
    console.log('[LOG][INFO] - WorkerManager - stopById - sucesso')
  }
}

