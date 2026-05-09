import { TEntryData } from "../../domain/useCases/data/TEntryData.js";
import { IQueue,  TQueueGroupPackageIndex } from "../interfaces/application/queue/IQueue.js";
import { WorkerThreadManager } from "./application/workersThreads/workers/WorkerThreadManager.js";
import { IWriteQueuePackageRepository } from "../interfaces/application/repositories/queuePackages/IWriteQueuePackageRepository.js";
import { E_LAYOUTS_PACKAGE_SIZE, E_OBRIGACAO, E_OBRIGACAO_CODIGO_LAYOUT, E_WORKER_PROCESS, E_WORKERS_PROCESS_QUEUE } from "../../domain/useCases/names/index.js";
import { sleep } from "../../utils/sleep.js";
import { WorkerThread } from "./application/workersThreads/workers/WorkerThread.js";





export class ProcessManager {
  constructor(
    private queue: IQueue,
    private workerThreadManager: WorkerThreadManager,
    private writeQueuePackageRepository: IWriteQueuePackageRepository
  ) {
    setInterval(() => this.handle([]), 5000)
  }



  public async handle(entryDataList: Array<TEntryData>, reprocessing: boolean = false): Promise<void> {

    if(!reprocessing !== false) await this.handleToAddElementInQueueAndPersist(entryDataList)
    const packagesExpired = this.queue.getPackagesWithTimeLimitExpired()
    const packageAlredyFoProcess = this.queue.collectPackagesAlredyForProcess()
    const packagerToProcess = [...packagesExpired, ...packageAlredyFoProcess]
    if (packagerToProcess.length === 0) return

    const totalWorkers = this.workerThreadManager.workerThreadsPool.size
    const packagePartsToProcess = this.brokePackagesToParts(packagerToProcess, totalWorkers)

    for (let i = 0; i < totalWorkers; i++) {
      const packagePart = packagePartsToProcess[i]

      const workerThread = this.workerThreadManager.workerThreadsPool.get(i)
      if (!packagePart || !workerThread) throw new Error("Erro ao distribuir os pacotes para os workers.")

      await this.awaitWorkerThreadIsIdle(workerThread)

      for (const { keyGroup, packageIndex } of packagePart) {
        const packageToProcess = this.queue.getAndUpdateStatusPackagesToProcessing(keyGroup, packageIndex)
        if (!packageToProcess) continue

        const structData = {
          identifier: E_WORKER_PROCESS.QUEUE,
          queue: {
            identifier: E_WORKERS_PROCESS_QUEUE.PROCESS_PACKAGE,
            message: { keyGroup, packageIndex }
          },
          worker: {
            id: workerThread.id
          }
        }

        const lista_eventos = []
        for (const [key, event] of packageToProcess.events) {
          lista_eventos.push(event)
        }

        workerThread.postMessage(structData, [...packageToProcess.events])
      }
    }
  }


  private async handleToAddElementInQueueAndPersist(entryDataList: Array<TEntryData>): Promise<void> {
    const dataPackageToPersist = new Array()

    for (const entryData of entryDataList) {
      const entryDataString = JSON.stringify(entryData)
      const queueResponse = this.queue.addItem(
        this.createKeyGroup(entryData),
        this.getEventId(entryData),
        entryDataString,
        this.getPackageSizeByCodeDynamic(entryData)
      )
      dataPackageToPersist.push({entryDataString: entryDataString, queueResponse})
    }
    await this.writeQueuePackageRepository.writePackage(dataPackageToPersist)
  }

  private getPackageSizeByCodeDynamic(entryData: TEntryData): number | undefined {
    let code = null
    if (entryData.event.obrigacao === E_OBRIGACAO.E_FINANCEIRA) code = entryData.event.efinanceira!.codLayout

    const chaveDoEnum = Object.keys(E_OBRIGACAO_CODIGO_LAYOUT).find(
      (key) => E_OBRIGACAO_CODIGO_LAYOUT[key as keyof typeof E_OBRIGACAO_CODIGO_LAYOUT] === code
    ) as keyof typeof E_LAYOUTS_PACKAGE_SIZE | undefined;

    if (chaveDoEnum && chaveDoEnum in E_LAYOUTS_PACKAGE_SIZE) return E_LAYOUTS_PACKAGE_SIZE[chaveDoEnum];
    return undefined;
  }

  private getEventId(entryData: TEntryData): string {
    if (entryData.event.obrigacao === E_OBRIGACAO.E_FINANCEIRA) return entryData.event.efinanceira!.evento.id
    throw new Error('Layout ainda nao implementado')
  }

  private async awaitWorkerThreadIsIdle(workerThread: WorkerThread): Promise<void> {
    while(true) {
        if(workerThread.workerIsBusy()) {
          await sleep(200)
          continue
        }
        break
      }
  }

  private createKeyGroup(entryData: TEntryData): string {
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

 private brokePackagesToParts(packagesToProcess: Array<TQueueGroupPackageIndex>, totalWorkers: number): Array<Array<TQueueGroupPackageIndex>>  {
    const packagesPartsToEachaWorker = new Array()
    for (let i = 0; i < totalWorkers; i++) {
      const sizeOfSlice = Math.ceil(packagesToProcess.length / totalWorkers)
      const part = packagesToProcess.slice(i * sizeOfSlice, (i + 1) * sizeOfSlice)
      packagesPartsToEachaWorker.push(part)
    }
    return packagesPartsToEachaWorker
  }
}
