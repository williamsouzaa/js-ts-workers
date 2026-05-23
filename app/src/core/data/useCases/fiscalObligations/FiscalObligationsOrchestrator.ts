import { EFINANCEIRA } from "../../../../environment.js"
import { IFiscalObligationsEventsPackage, TEventData, TPackageReference } from "../../../domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { E_OBRIGACOES, E_WORKER_PROCESS } from "../../../domain/fiscalObligations/names.js"
import { IWritefiscalObligationsPackageRepository } from "../../../domain/fiscalObligations/repositories/IWriteFiscalObligationsPackageRepository.js"
import { TFiscalObligationsEntryData } from "../../../domain/fiscalObligations/TFiscalObligationsEntryData.js"
import { TWorkerListenerStructData } from "../../interfaces/application/workers/IWorkerListener.js"
import { IWorkersPool } from "../../interfaces/application/workers/IWorkersPool.js"


export class FiscalObligationsOrchestrator {
  private max_in_memory_events = 20 * 1000

  constructor(
    private fiscalObligationsEventsPackage: IFiscalObligationsEventsPackage,
    private workersPool: IWorkersPool<TFiscalObligationsEntryData>,
    private writefiscalObligationsPackageRepository: IWritefiscalObligationsPackageRepository
  ) {
    setInterval(() => this.handle([], false), 1000 * 60)
  }

  public async handle(entryDataList: Array<TFiscalObligationsEntryData>, reprocessing: boolean = false): Promise<void> {
    try {
      if (!reprocessing) await this.handleToAddElementInPackageAndPersist(entryDataList)

      const packagesToProcess: Array<TPackageReference> = this.fiscalObligationsEventsPackage.collectPackagesReadyToProcess()
      if (packagesToProcess.length === 0) return

      const totalWorkers = this.workersPool.workerThreadsPool.size
      const sizeOfSlice = Math.ceil(packagesToProcess.length / totalWorkers)
      const packagePartsToProcess = this.splitPackagesAcrossWorkers(packagesToProcess, totalWorkers, sizeOfSlice)

      const dispatchPromises: Array<Promise<void>> = []

      for (let i = 0; i < totalWorkers; i++) {
        const packagePart = packagePartsToProcess[i]
        const workerThread = this.workersPool.workerThreadsPool.get(i)
        if (!packagePart || !workerThread) throw new Error("Erro ao distribuir os pacotes para os workers.")

        for (const { keyGroup, packageIndex } of packagePart) {
          const packageToProcess = this.fiscalObligationsEventsPackage.getAndUpdateStatusPackagesToProcessing(keyGroup, packageIndex)
          if (!packageToProcess) continue

          const structData = {
            identifier: E_WORKER_PROCESS.FISCAL_OBLIGATIONS_EVENTS_PACKAGE,
            fiscalObligationsEventsPackage: { packageReference: { keyGroup, packageIndex } },
            worker: { id: workerThread.id },
            message: "mainThread"
          } as TWorkerListenerStructData<TFiscalObligationsEntryData>

          const events: Array<TEventData> = []
          for (const [, event] of packageToProcess.events) events.push(event)

          dispatchPromises.push(workerThread.postMessage(structData, events))
        }
      }

      await Promise.all(dispatchPromises)
    } catch(error) {
      console.log('FiscalObligationsOrchestrator - handle - error', error)
    }
  }

  public hasCapacity(): boolean {
    return this.fiscalObligationsEventsPackage.getTotalEventCount() < this.max_in_memory_events
  }

  private async handleToAddElementInPackageAndPersist(entryDataList: Array<TFiscalObligationsEntryData>): Promise<void> {
    try {
      const dataPackageToPersist = new Array()

      for (const entryData of entryDataList) {
        const entryDataString = JSON.stringify(entryData)
        const eventDetails = this.fiscalObligationsEventsPackage.addItem(
          this.createKeyGroup(entryData),
          this.getEventId(entryData),
          entryDataString,
          this.getPackageSizeByCodeDynamic(entryData)
        )
        dataPackageToPersist.push({ entryDataString, eventDetails })
      }
      await this.writefiscalObligationsPackageRepository.writePackage(dataPackageToPersist)
    } catch(error) {
      console.log('FiscalObligationsOrchestrator - handleToAddElementInPackageAndPersist - entryDataList', entryDataList)
      console.log('FiscalObligationsOrchestrator - handleToAddElementInPackageAndPersist - error', error)
    }
  }

  private getPackageSizeByCodeDynamic(entryData: TFiscalObligationsEntryData): number | undefined {
    const { obrigacao, efinanceira } = entryData.event
    if (obrigacao !== E_OBRIGACOES.EFINANCEIRA || !efinanceira?.codLayout) return undefined
    return EFINANCEIRA.LAYOUT_MAX_PACKAGE_SIZE[efinanceira!.codLayout] as typeof EFINANCEIRA.LAYOUT_MAX_PACKAGE_SIZE[keyof typeof EFINANCEIRA.LAYOUT_MAX_PACKAGE_SIZE]
  }

  private getEventId(entryData: TFiscalObligationsEntryData): string {
    if (entryData.event.obrigacao === E_OBRIGACOES.EFINANCEIRA) return entryData.event.efinanceira!.idGov
    throw new Error('getEventId - Layout not implemented')
  }

  private createKeyGroup(entryData: TFiscalObligationsEntryData): string {
    const keyParts: any = []

    if (entryData.event.obrigacao === E_OBRIGACOES.EFINANCEIRA) {
      keyParts.push(
        E_OBRIGACOES.EFINANCEIRA,
        entryData.event.efinanceira?.codLayout,
        entryData.event.efinanceira?.cnpjEmpresa,
        entryData.event.efinanceira?.ano,
        entryData.event.efinanceira?.mes,
      )
    }

    if (keyParts.length === 0) throw new Error('Erro ao montar keyParts em ProcessManager.getKeyGroup')
    return keyParts.filter((part: any) => part !== undefined && part !== null).join('#')
  }

  private splitPackagesAcrossWorkers(packagesToProcess: Array<TPackageReference>, totalWorkers: number, sizeOfSlice: number): Array<Array<TPackageReference>> {
    const parts: Array<Array<TPackageReference>> = []
    for (let i = 0; i < totalWorkers; i++) {
      parts.push(packagesToProcess.slice(i * sizeOfSlice, (i + 1) * sizeOfSlice))
    }
    return parts
  }
}
