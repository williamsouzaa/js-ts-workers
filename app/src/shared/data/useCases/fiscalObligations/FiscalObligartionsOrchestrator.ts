
import { sleep } from "../../../../utils/sleep.js"
import { IFiscalObligationsEventsPackage, TPackageReference } from "../../../domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { E_WORKER_PROCESS, E_OBRIGACAO, E_OBRIGACAO_CODIGO_LAYOUT, E_LAYOUTS_PACKAGE_SIZE } from "../../../domain/fiscalObligations/names.js"
import { IWritefiscalOBligationsPackageRepository } from "../../../domain/fiscalObligations/repositories/IWriteFiscalOBligartionsPackageRepository.js"
import { TFiscalOBligationsEntryData } from "../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js"
import { IWorker } from "../../interfaces/application/workers/IWorker.js"
import { TWorkerListenerStructData } from "../../interfaces/application/workers/IWorkerListener.js"
import { IWorkersPool } from "../../interfaces/application/workers/IWorkersPool.js"

export class FiscalOBligationsOrchestrator {
  constructor(
    private fiscalOBligationsEventsPackage: IFiscalObligationsEventsPackage,
    private workersPool: IWorkersPool<TFiscalOBligationsEntryData>,
    private writefiscalOBligationsPackageRepository: IWritefiscalOBligationsPackageRepository
  ) {
    setInterval(() => this.handle([], false), 1000 * 60)
  }

  public async handle(entryDataList: Array<TFiscalOBligationsEntryData>, reprocessing: boolean = false): Promise<void> {
    try {
      if (!reprocessing) await this.handleToAddElementInPackageAndPersist(entryDataList)

      const packagesExpired: Array<TPackageReference> = this.fiscalOBligationsEventsPackage.getPackagesWithTimeLimitExpired()
      const packageAlredyFoProcess: Array<TPackageReference> = this.fiscalOBligationsEventsPackage.collectPackagesAlredyForProcess()
      const packagerToProcess: Array<TPackageReference> = [...packagesExpired, ...packageAlredyFoProcess]
      if (packagerToProcess.length === 0) return

      const totalWorkers = this.workersPool.workerThreadsPool.size
      const packagePartsToProcess = this.brokePackagesToParts(packagerToProcess, totalWorkers)

      for (let i = 0; i < totalWorkers; i++) {
        const packagePart = packagePartsToProcess[i]
        const workerThread = this.workersPool.workerThreadsPool.get(i)
        if (!packagePart || !workerThread) throw new Error("Erro ao distribuir os pacotes para os workers.")

        for (const { keyGroup, packageIndex } of packagePart) {
          const packageToProcess = this.fiscalOBligationsEventsPackage.getAndUpdateStatusPackagesToProcessing(keyGroup, packageIndex)

          if (!packageToProcess) continue
          const structData = {
            identifier: E_WORKER_PROCESS.FISCAL_OBLIGARTIONS_EVENTS_PACKAGE,
            fiscalOBligationsEventsPackage: { packageReference: {keyGroup, packageIndex} },
            worker: { id: workerThread.id },
            message: "mainThread"
          } as TWorkerListenerStructData<TFiscalOBligationsEntryData>

          const events = []
          for (const [_, event] of packageToProcess.events) {
            events.push(event)
          }
          await workerThread.postMessage(structData, events)
        }
      }
    } catch(error) {
      console.log('FiscalOBligationsOrchestrator - handle - error', error)
    }
  }


  private async handleToAddElementInPackageAndPersist(entryDataList: Array<TFiscalOBligationsEntryData>): Promise<void> {
    try {
      const dataPackageToPersist = new Array()
      for (const entryData of entryDataList) {
        const entryDataString = JSON.stringify(entryData)
        const eventDetails = this.fiscalOBligationsEventsPackage.addItem(
          this.createKeyGroup(entryData),
          this.getEventId(entryData),
          entryDataString,
          this.getPackageSizeByCodeDynamic(entryData)
        )
        dataPackageToPersist.push({entryDataString: entryDataString, eventDetails})
      }
      await this.writefiscalOBligationsPackageRepository.writePackage(dataPackageToPersist)
    }catch(error) {
      console.log('FiscalOBligationsOrchestrator - handleToAddElementInPackageAndPersist - entryDataList', entryDataList)
      console.log('FiscalOBligationsOrchestrator - handleToAddElementInPackageAndPersist - error', error)
    }
  }

  private getPackageSizeByCodeDynamic(entryData: TFiscalOBligationsEntryData): number | undefined {
    let code = null
    if (entryData.event.obrigacao === E_OBRIGACAO.E_FINANCEIRA) code = entryData.event.efinanceira!.codLayout

    const chaveDoEnum = Object.keys(E_OBRIGACAO_CODIGO_LAYOUT).find(
      (key) => E_OBRIGACAO_CODIGO_LAYOUT[key as keyof typeof E_OBRIGACAO_CODIGO_LAYOUT] === code
    ) as keyof typeof E_LAYOUTS_PACKAGE_SIZE | undefined;

    if (chaveDoEnum && chaveDoEnum in E_LAYOUTS_PACKAGE_SIZE) return E_LAYOUTS_PACKAGE_SIZE[chaveDoEnum];
    return undefined;
  }

  private getEventId(entryData: TFiscalOBligationsEntryData): string {
    if (entryData.event.obrigacao === E_OBRIGACAO.E_FINANCEIRA) return entryData.event.efinanceira!.idGov
    throw new Error('Layout ainda nao implementado')
  }

  private createKeyGroup(entryData: TFiscalOBligationsEntryData): string {
    const keyParts: any = []

    if (entryData.event.obrigacao === E_OBRIGACAO.E_FINANCEIRA) {
      keyParts.push(
        E_OBRIGACAO.E_FINANCEIRA,
        entryData.event.efinanceira?.codLayout,
        entryData.event.efinanceira?.cnpjEmpresa,
        entryData.event.efinanceira?.ano,
        entryData.event.efinanceira?.mes,
      )
    }

    if (keyParts.length === 0) throw new Error('Erro ao montar keyParts em ProcessManager.getKeyGroup')
    return keyParts.filter((part: any) => part !== undefined && part !== null).join('#');
  }

 private brokePackagesToParts(packagesToProcess: Array<TPackageReference>, totalWorkers: number): Array<Array<TPackageReference>>  {
    const packagesPartsToEachaWorker = new Array()
    for (let i = 0; i < totalWorkers; i++) {
      const sizeOfSlice = Math.ceil(packagesToProcess.length / totalWorkers)
      const part = packagesToProcess.slice(i * sizeOfSlice, (i + 1) * sizeOfSlice)
      packagesPartsToEachaWorker.push(part)
    }
    return packagesPartsToEachaWorker
  }
}
