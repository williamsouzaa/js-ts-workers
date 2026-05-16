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

// child_process: identity comes from env vars set by the parent via fork()
const workerData = {
  name: process.env.WORKER_NAME ?? 'unknown',
  workerId: parseInt(process.env.WORKER_ID ?? '0', 10)
}

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
    // child_process: use process.on('message') instead of parentPort.on('message')
    process.on('message', async (message: TPostMessageStrucData<Array<TFiscalOBligationsEntryData>>) => {
      // Decode base64-encoded binary data sent by the parent (AWorkerThread)
      const decodedMessage = this.decodeBinaryData(message)
      process.send!(this.receivedMessage(decodedMessage))
      await listener.handle(decodedMessage)
    })
  }

  // The parent encodes ArrayBuffers as base64 strings because child_process IPC
  // uses JSON serialisation. We reconstruct Uint8Array instances here so the
  // rest of the pipeline (handleToBuildMessageToProcess, etc.) works unchanged.
  private decodeBinaryData(
    message: TPostMessageStrucData<Array<TFiscalOBligationsEntryData>>
  ): TPostMessageStrucData<Array<TFiscalOBligationsEntryData>> {
    const encoding = (message as any)._encoding as string | undefined
    if (!encoding) return message

    if (encoding === 'base64list' && Array.isArray(message.binaryData)) {
      const decoded = (message.binaryData as unknown as string[]).map(
        (b64) => new Uint8Array(Buffer.from(b64, 'base64'))
      )
      return { ...message, binaryData: decoded as any }
    }

    if (encoding === 'base64' && typeof message.binaryData === 'string') {
      const decoded = new Uint8Array(Buffer.from(message.binaryData as unknown as string, 'base64'))
      return { ...message, binaryData: decoded as any }
    }

    return message
  }

  private receivedMessage(
    structData: TPostMessageStrucData<Array<TFiscalOBligationsEntryData>>
  ): TPostMessageStrucData<TFiscalOBligationsEntryData> {
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
