import { parentPort, workerData } from "worker_threads"
import { IParentPortWorkerThread } from "../../../../../interfaces/application/workers/IParentPortWorkerThread.js"
import { TPostMessageStrucData } from "../../../../../interfaces/application/workers/TPostMessageStrucData.js"
import { IWorkerThreadListener } from "../../../../../interfaces/application/workers/IWorkerThreadListener.js"
import { EfinanceiraQueueProcesssPackage } from "../../../../../modules/efinanceira/data/useCases/workers/listeners/processPackage/EfinanceiraQueueProcesssPackage.js"
import { RedisClient } from "../../../../../../infra/databases/connections/redis/RedisConnect.js"
import { E_WORKER_PROCESS, E_WORKERS_PROCESS_QUEUE } from "../../../../../../domain/useCases/names/index.js"

class WorkerListenerToProcessQueuePackage implements IWorkerThreadListener {
  public async handle() {
    await this.databases()
    this.listen(new EfinanceiraQueueProcesssPackage())
  }

  private listen(listener: IParentPortWorkerThread): void {
     parentPort!.on('message', async (message: TPostMessageStrucData) => {
      parentPort!.postMessage(this.receivedMessage(message))
      await listener.handle(message)
    })
  }

  private receivedMessage(structData: TPostMessageStrucData): TPostMessageStrucData {
    return {
      identifier: E_WORKER_PROCESS.QUEUE,
      queue: {
        identifier: E_WORKERS_PROCESS_QUEUE.PROCESS_PACKAGE,
        message: {
          identifier: "received",
        },
        processPackage: {
          keyGroup: structData.queue!.processPackage!.keyGroup,
          packageIndex: structData.queue!.processPackage!.packageIndex
        },
      },
      worker: {
        id: workerData.workerId,
      }
    }
  }

  private async databases(): Promise<void> {
    const redis = new RedisClient()
    await redis.connect()
  }
}

new WorkerListenerToProcessQueuePackage().handle()