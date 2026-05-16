import { parentPort, workerData } from "worker_threads"
import { IParentPortWorkerThread, TPostMessageStrucData } from "../../../../../../shared/data/interfaces/application/workers/IParentPortWorkerThread.js"
import { IWorkerThreadListener } from "../../../../../../shared/data/interfaces/application/workers/IWorkerThreadListener.js"
import { RedisClient } from "../../../../../../shared/infra/databases/connections/redis/RedisConnect.js"
import { E_WORKER_PROCESS } from "../../../../domain/names.js"
import { EfinanceiraProcesssPackageListener } from "../../../../../efinanceira/data/useCases/workers/EfinanceiraProcesssPackageListener.js"
import { TFiscalOBligationsEntryData } from "../../../../domain/contracts/TFiscalOBligartionsEntryData.js"

class WorkerListenerToProcessQueuePackage implements IWorkerThreadListener {
  public async handle() {
    await this.databases()
    this.listen(new EfinanceiraProcesssPackageListener())
  }

  private listen(listener: IParentPortWorkerThread<Array<TFiscalOBligationsEntryData>>): void {
     parentPort!.on('message', async (message: TPostMessageStrucData<Array<TFiscalOBligationsEntryData>>) => {
      parentPort!.postMessage(this.receivedMessage(message))
      await listener.handle(message)
    })
  }

  private receivedMessage(structData: TPostMessageStrucData<Array<TFiscalOBligationsEntryData>>): TPostMessageStrucData<TFiscalOBligationsEntryData> {
    return {
      identifier: E_WORKER_PROCESS.FISCAL_OBLIGARTIONS_EVENTS_PACKAGE,
      message: "received",
      fiscalOBligationsEventsPackage: structData.fiscalOBligationsEventsPackage,
      worker: { id: workerData.workerId }
    } as TPostMessageStrucData<TFiscalOBligationsEntryData>
  }

  private async databases(): Promise<void> {
    const redis = new RedisClient()
    await redis.connect()
  }
}

new WorkerListenerToProcessQueuePackage().handle()