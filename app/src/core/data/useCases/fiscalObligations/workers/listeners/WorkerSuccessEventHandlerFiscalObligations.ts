import { IWorkerSuccessEventHandler } from "../../../../../../core/data/interfaces/application/workers/events/IWorkerSuccessEventHandler.js"
import { IFiscalObligationsEventsPackage } from "../../../../../domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { E_WORKER_PROCESS } from "../../../../../domain/fiscalObligations/names.js"
import { IDeleteEventsFiscalObligationsPackageRepository } from "../../../../../domain/fiscalObligations/repositories/IDeleteEventsFiscalObligationsPackageRepository.js"
import { TFiscalObligationsEntryData } from "../../../../../domain/fiscalObligations/TFiscalObligationsEntryData.js"
import { TWorkerListenerStructData } from "../../../../interfaces/application/workers/IWorkerListener.js"

export class WorkerSuccessEventHandlerFiscalObligations implements IWorkerSuccessEventHandler<TFiscalObligationsEntryData> {
  constructor(
    private fiscalObligationsEventsPackage: IFiscalObligationsEventsPackage,
    private deleteEventsFiscalObligationsPackageRepository: IDeleteEventsFiscalObligationsPackageRepository
  ) {}

  public async handle(structData: TWorkerListenerStructData<any>): Promise<void> {
    if (structData.identifier === E_WORKER_PROCESS.FISCAL_OBLIGATIONS_EVENTS_PACKAGE) return this.handleIFiscalObligationsEventsPackage(structData)
    console.log('There are new structData.identifier to be implement', structData)
  }

  private async handleIFiscalObligationsEventsPackage(structData: TWorkerListenerStructData<any>): Promise<void> {
    if (!structData.fiscalObligationsEventsPackage) throw new Error("Message queue is undefined in handleQueueMessage")
    if (structData.message === "received") return this.handleQueueMessageReceived(structData)
    if (structData.message === "processed") return this.handleQueueMessageProcessed(structData)
    throw new Error('There are new structData.message to be implement')
  }

  private async handleQueueMessageReceived(structData: TWorkerListenerStructData<TFiscalObligationsEntryData>): Promise<void> {
    this.fiscalObligationsEventsPackage.deletePackage(
      structData.fiscalObligationsEventsPackage!.packageReference.keyGroup,
      structData.fiscalObligationsEventsPackage!.packageReference.packageIndex
    )
  }

  private async handleQueueMessageProcessed(structData: TWorkerListenerStructData<Array<string>>): Promise<void> {
    await this.deleteEventsFiscalObligationsPackageRepository.deleteEvents(structData.fiscalObligationsEventsPackage?.packageReference!, structData.entryData!)
  }
}