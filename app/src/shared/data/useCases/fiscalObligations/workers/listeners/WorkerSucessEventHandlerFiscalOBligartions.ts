import { IWorkerSucessEventHandler } from "../../../../../../shared/data/interfaces/application/workers/events/IWorkerSucessEventHandler.js"
import { IFiscalObligationsEventsPackage } from "../../../../../domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { E_WORKER_PROCESS } from "../../../../../domain/fiscalObligations/names.js"
import { IDeleteEventsFiscalOBligartionsPackageRepository } from "../../../../../domain/fiscalObligations/repositories/IDeleteEventsFiscalOBligartionsPackageRepository.js"
import { TFiscalOBligationsEntryData } from "../../../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js"
import { TWorkerListenerStructData } from "../../../../interfaces/application/workers/IWorkerListener.js"

export class WorkerSucessEventHandlerfiscalOBligations implements IWorkerSucessEventHandler<TFiscalOBligationsEntryData> {
  constructor(
    private fiscalOBligationsEventsPackage: IFiscalObligationsEventsPackage,
    private deleteEventsFiscalOBligartionsPackageRepository: IDeleteEventsFiscalOBligartionsPackageRepository
  ) {}

  public async handle(structData: TWorkerListenerStructData<any>): Promise<void> {
    if (structData.identifier === E_WORKER_PROCESS.FISCAL_OBLIGARTIONS_EVENTS_PACKAGE) return this.handlefiscalOBligationsEventsPackage(structData)
    console.log('There are new structData.identifier to be implement', structData)
  }

  private async handlefiscalOBligationsEventsPackage(structData: TWorkerListenerStructData<any>): Promise<void> {
    if (!structData.fiscalOBligationsEventsPackage) throw new Error("Message queue is undefined in handleQueueMessage")
    if (structData.message === "received") return this.handleQueueMessageReceived(structData)
    if (structData.message === "processed") return this.handleQueueMessageProcessed(structData)
    throw new Error('There are new structData.message to be implement')
  }

  private async handleQueueMessageReceived(structData: TWorkerListenerStructData<TFiscalOBligationsEntryData>): Promise<void> {
    this.fiscalOBligationsEventsPackage.deletePackage(
      structData.fiscalOBligationsEventsPackage!.packageReference.keyGroup,
      structData.fiscalOBligationsEventsPackage!.packageReference.packageIndex
    )
  }

  private async handleQueueMessageProcessed(structData: TWorkerListenerStructData<Array<string>>): Promise<void> {
    await this.deleteEventsFiscalOBligartionsPackageRepository.deleteEvents(structData.fiscalOBligationsEventsPackage?.packageReference!, structData.entryData!)
  }
}