import { parentPort, workerData } from "worker_threads"
import { IParentPortWorkerThread, TPostMessageStrucData } from "../../../../../../shared/data/interfaces/application/workers/IParentPortWorkerThread.js"
import { IWorkerThreadListener } from "../../../../../../shared/data/interfaces/application/workers/IWorkerThreadListener.js"
import { RedisClient } from "../../../../../../shared/infra/databases/connections/redis/RedisConnect.js"
import { EfinanceiraProcesssPackageListener } from "../../../../../../modules/efinanceira/data/useCases/workers/EfinanceiraProcesssPackageListener.js"
import { E_WORKER_PROCESS } from "../../../../../domain/fiscalObligations/names.js"
import { TFiscalOBligationsEntryData } from "../../../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js"
import { ObjectToXsdMapperEfinanceiraAbertura } from "../../../../../../modules/efinanceira/data/useCases/objectToXsdMapper/ObjectToXsdMapperEfinanceiraAbertura.js"
import { ObjectToXsdMapperEfinanceiraMovFin } from "../../../../../../modules/efinanceira/data/useCases/objectToXsdMapper/ObjectToXsdMapperEfinanceiraMovFin.js"
import { EfinanceiraValidateXmlWithXsdLibxmljsAdapter } from "../../../../../../modules/efinanceira/infra/libs/libxmljs/EfinanceiraValidateXmlWithXsdLibxmljsAdapter.js"
import { Xmlbuilder2EfinanceiraObjectToXmlConverterAdapter } from "../../../../../../modules/efinanceira/infra/libs/xmlbuilder2/Xmlbuilder2EfinanceiraObjectToXmlConverterAdapter.js"

import libxmljs from 'libxmljs2';


class WorkerListenerToProcessFiscalOBligartions implements IWorkerThreadListener {
  public async handle() {
    await this.databases()

    const efinanceiraValidateXmlWithXsdAdapter = new EfinanceiraValidateXmlWithXsdLibxmljsAdapter()
    efinanceiraValidateXmlWithXsdAdapter.setAllLayoutsXSD()


    this.listen(
      new EfinanceiraProcesssPackageListener(
        [
          new ObjectToXsdMapperEfinanceiraAbertura(),
          new ObjectToXsdMapperEfinanceiraMovFin(),
        ],
        new Xmlbuilder2EfinanceiraObjectToXmlConverterAdapter(),
        efinanceiraValidateXmlWithXsdAdapter
      )
    )
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

new WorkerListenerToProcessFiscalOBligartions().handle()