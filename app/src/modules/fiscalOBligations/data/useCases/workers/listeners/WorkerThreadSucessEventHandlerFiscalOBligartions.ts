import { IWorkerThreadSucessEventHandler } from "../../../../../../shared/data/interfaces/application/workers/events/IWorkerThreadSucessEventHandler.js"
import { TPostMessageStrucData } from "../../../../../../shared/data/interfaces/application/workers/IParentPortWorkerThread.js"
import { IFiscalObligationsEventsPackage } from "../../../../domain/contracts/IFiscalObligationsEventsPackage.js"
import { TFiscalOBligationsEntryData } from "../../../../domain/contracts/TFiscalOBligartionsEntryData.js"
import { E_WORKER_PROCESS } from "../../../../domain/names.js"

export class WorkerThreadSucessEventHandlerfiscalOBligations implements IWorkerThreadSucessEventHandler<TFiscalOBligationsEntryData> {
  constructor(private fiscalOBligationsEventsPackage: IFiscalObligationsEventsPackage) {}

  public async handle(structData: TPostMessageStrucData<TFiscalOBligationsEntryData>): Promise<void> {

    console.log("WorkerThreadSucessEventHandlerfiscalOBligations: ", structData)

    if (structData.identifier === E_WORKER_PROCESS.FISCAL_OBLIGARTIONS_EVENTS_PACKAGE) return this.handlefiscalOBligationsEventsPackage(structData)
  }

  private async handlefiscalOBligationsEventsPackage(message: TPostMessageStrucData<TFiscalOBligationsEntryData>): Promise<void> {
    if (!message.fiscalOBligationsEventsPackage) throw new Error("Message queue is undefined in handleQueueMessage")

    if (message.message === "received") return this.handleQueueMessageReceived(message)
    console.log(`caindo fora da classe aqui - Lidar com isso:`, message.fiscalOBligationsEventsPackage)
  }

  private async handleQueueMessageReceived(message: TPostMessageStrucData<TFiscalOBligationsEntryData>): Promise<void> {
    this.fiscalOBligationsEventsPackage.clearEventsInPackage(
      message.fiscalOBligationsEventsPackage!.packageReference.keyGroup,
      message.fiscalOBligationsEventsPackage!.packageReference.packageIndex
    )
  }
}