import { IWorkerSucessEventHandler } from "../../../../../../shared/data/interfaces/application/workers/events/IWorkerSucessEventHandler.js"
import { TPostMessageStrucData } from "../../../../../../shared/data/interfaces/application/workers/IParentPortWorker.js"
import { IFiscalObligationsEventsPackage } from "../../../../../domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { E_WORKER_PROCESS } from "../../../../../domain/fiscalObligations/names.js"
import { TFiscalOBligationsEntryData } from "../../../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js"

export class WorkerSucessEventHandlerfiscalOBligations implements IWorkerSucessEventHandler<TFiscalOBligationsEntryData> {
  constructor(private fiscalOBligationsEventsPackage: IFiscalObligationsEventsPackage) {}

  public async handle(structData: TPostMessageStrucData<TFiscalOBligationsEntryData>): Promise<void> {
    // console.log("WorkerSucessEventHandlerfiscalOBligations: ", structData)
    if (structData.identifier === E_WORKER_PROCESS.FISCAL_OBLIGARTIONS_EVENTS_PACKAGE) return this.handlefiscalOBligationsEventsPackage(structData)
  }

  private async handlefiscalOBligationsEventsPackage(message: TPostMessageStrucData<TFiscalOBligationsEntryData>): Promise<void> {
    if (!message.fiscalOBligationsEventsPackage) throw new Error("Message queue is undefined in handleQueueMessage")

    if (message.message === "received") return this.handleQueueMessageReceived(message)
    console.log(`caindo fora da classe aqui - Lidar com isso:`, message.fiscalOBligationsEventsPackage)
  }

  private async handleQueueMessageReceived(message: TPostMessageStrucData<TFiscalOBligationsEntryData>): Promise<void> {
    console.log('handleQueueMessageReceived', message)

    this.fiscalOBligationsEventsPackage.clearEventsInPackage(
      message.fiscalOBligationsEventsPackage!.packageReference.keyGroup,
      message.fiscalOBligationsEventsPackage!.packageReference.packageIndex
    )
  }
}