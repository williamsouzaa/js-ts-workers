import { pipeline } from "node:stream";
import { TEntryData, TEntryDataReceived, TRawEntryData, TReceived, TTEntryDataEvent } from "../../domain/useCases/data/TEntryData.js";
import { IQueue, TQueueAddItemResponse, TQueueGroupPackageIndex, TQueueMapKeysAndEvents } from "../interfaces/application/queue/IQueue.js";
import { RedisClient } from "../../infra/databases/connections/redis/RedisConnect.js";
import { WorkerThreadManager } from "./application/workersThreads/workers/WorkerThreadManager.js";
import { IWriteQueuePackageRepository } from "../interfaces/application/repositories/queuePackages/IWriteQueuePackageRepository.js";
import { EWorkersProcess, EWorkersProcessQueue } from "../../domain/useCases/names/index.js";


export class ProcessManager {
  constructor(
    private queue: IQueue,
    private workerThreadManager: WorkerThreadManager,
    private writeQueuePackageRepository: IWriteQueuePackageRepository
  ) {}

  public async handle(entryDataList: Array<TEntryDataReceived>): Promise<void> {
    const dataPackageToPersist = new Array()
    for (const { entryData, rawEntryData, received } of entryDataList) {
      const eventId = entryData.event.id
      const keyGroup = this.buildKeyGroup(entryData.event)
      const queueResponse = this.queue.addItem(keyGroup, eventId, entryData)
      dataPackageToPersist.push({rawEntryData, received, queueResponse})
    }

    await this.writeQueuePackageRepository.writePackage(dataPackageToPersist)

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

      for (const { keyGroup, packageIndex } of packagePart) {
        const packageToProcess = this.queue.getAndUpdateStatusPackagesToProcessing(keyGroup, packageIndex)
        if (!packageToProcess) continue

        const structData = {
          identifier: EWorkersProcess.QUEUE,
          queue: {
            identifier: EWorkersProcessQueue.PROCESS_PACKAGE,
            message: { keyGroup, packageIndex }
          },
          worker: {
            id: workerThread.id
          }
        }
        workerThread.postMessage(structData, this.convertPackageToStringJson(packageToProcess.events))
      }
    }
  }

 brokePackagesToParts(packagesToProcess: Array<TQueueGroupPackageIndex>, totalWorkers: number): Array<Array<TQueueGroupPackageIndex>>  {
    const packagesPartsToEachaWorker = new Array()
    for (let i = 0; i < totalWorkers; i++) {
      const sizeOfSlice = Math.ceil(packagesToProcess.length / totalWorkers)
      const part = packagesToProcess.slice(i * sizeOfSlice, (i + 1) * sizeOfSlice)
      packagesPartsToEachaWorker.push(part)
    }
    return packagesPartsToEachaWorker
  }

  private convertPackageToStringJson(eventData: any): string {
    const eventsArrayStrings: string[] = [];
    for (const [eventId, data] of eventData) {
      const eventJson = JSON.stringify(data.event);
      const eventoCompletoStr = `{"eventId":"${eventId}", "event":${eventJson}, "rawData":${data.rawData}}`;
      eventsArrayStrings.push(eventoCompletoStr);
    }
    return `[${eventsArrayStrings.join(',')}]`
  }

  private buildKeyGroup(event: TTEntryDataEvent): string {
    const keyParts = [
      event.obrigacao,
      event.cnpjEmpresa,
      event.codigoLayout,
      event.anoObrigacao,
      event.mesObrigacao,
      event.diaObrigacao
    ];
    return keyParts.filter(part => part !== undefined && part !== null).join('#');
  }
}
