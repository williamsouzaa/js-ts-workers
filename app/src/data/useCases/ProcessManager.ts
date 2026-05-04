import { pipeline } from "node:stream";
import { TEntryData, TEntryDataReceived, TRawEntryData, TReceived, TTEntryDataEvent } from "../../domain/useCases/data/TEntryData.js";
import { IQueue, TQueueAddItemResponse, TQueueGroupPackageIndex, TQueueMapKeysAndEvents } from "../interfaces/application/queue/IQueue.js";
import { RedisClient } from "../../infra/databases/connections/redis/RedisConnect.js";
import { WorkerThreadManager } from "./application/workersThreads/workers/WorkerThreadManager.js";


export class ProcessManager {
  constructor(
    private queue: IQueue,
    private workerThreadManager: WorkerThreadManager
  ) {}

  public async handle(entryDataList: Array<TEntryDataReceived>): Promise<void> {
    const redisPackage = new Array()

    for (const { entryData, rawEntryData, received } of entryDataList) {
      const eventId = entryData.event.id
      const keyGroup = this.buildKeyGroup(entryData.event)
      const queueResponse = this.queue.addItem(keyGroup, eventId, entryData)
      redisPackage.push({rawEntryData, received, queueResponse})
    }

    await this.writeRedisPackage(redisPackage)

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
          identifier: "queue",
          queue: {
            identifier: "processPakage",
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

  private async writeRedisPackage(redisPackage: Array<{rawEntryData: TRawEntryData, received: TReceived, queueResponse: TQueueAddItemResponse}>): Promise<void> {
    const pipeline = RedisClient.client.multi()

    const redisRawEntryData: Record<string, Record<string, string>> = {}
    const redisReceivedFrom: Record<string, Record<string, string>> = {}
    const redisIndexKeysRawEntryData: Record<string, Set<string>> = {}
    const redisIndexReceivedFrom: Record<string, Set<string>> = {}

    for (const { queueResponse, rawEntryData, received } of redisPackage) {
      if (!Object.hasOwn(redisIndexKeysRawEntryData, `${queueResponse.keyGroup}#RECEIVED_FROM#PACKAGE#INDEX`)) {
        redisIndexKeysRawEntryData[`${queueResponse.keyGroup}#RECEIVED_FROM#PACKAGE#INDEX`] = new Set<string>()
      }
      redisIndexKeysRawEntryData[`${queueResponse.keyGroup}#RECEIVED_FROM#PACKAGE#INDEX`]!.add(queueResponse.package.lastPackageId.toString())

      if (!Object.hasOwn(redisIndexReceivedFrom, `${queueResponse.keyGroup}#RECEIVED_FROM#PACKAGE#INDEX`)) {
        redisIndexReceivedFrom[`${queueResponse.keyGroup}#RECEIVED_FROM#PACKAGE#INDEX`] = new Set<string>()
      }
      redisIndexReceivedFrom[`${queueResponse.keyGroup}#RECEIVED_FROM#PACKAGE#INDEX`]!.add(queueResponse.package.lastPackageId.toString())

      const redisRawEntryDataKey: string = `${queueResponse.keyGroup}#RAW_ENTRY_DATA#PACKAGE#${queueResponse.package.lastPackageId}`
      if (!Object.hasOwn(redisRawEntryData, redisRawEntryDataKey)) {
        redisRawEntryData[redisRawEntryDataKey] = {}
      }
      redisRawEntryData[redisRawEntryDataKey]![queueResponse.package.eventId] = rawEntryData

      const redisReceivedFromKey = `${queueResponse.keyGroup}#RECEIVED_FROM#PACKAGE#${queueResponse.package.lastPackageId}`
      if (!Object.hasOwn(redisReceivedFrom, redisReceivedFromKey)) {
        redisReceivedFrom[redisReceivedFromKey] = {}
      }
      redisReceivedFrom[redisReceivedFromKey]![queueResponse.package.eventId] = JSON.stringify(received)
    }

    Object.entries(redisIndexKeysRawEntryData).forEach(([key, value]) => {if (value.size > 0) pipeline.sAdd(key, [...value])});
    Object.entries(redisIndexReceivedFrom).forEach(([key, value]) => {if (value.size > 0) pipeline.sAdd(key, [...value])});

    Object.entries(redisRawEntryData).forEach(([key, value]) => {if (Object.keys(value).length > 0) pipeline.hSet(key, value)} );
    Object.entries(redisReceivedFrom).forEach(([key, value]) => {if (Object.keys(value).length > 0) pipeline.hSet(key, value)} );

    await pipeline.exec();
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
