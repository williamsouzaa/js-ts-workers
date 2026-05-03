import { pipeline } from "node:stream";
import { TEntryData, TEntryDataReceived, TRawEntryData, TReceived, TTEntryDataEvent } from "../../domain/useCases/data/TEntryData.js";
import { IQueue, TQueueAddItemResponse } from "../interfaces/application/queue/IQueue.js";
import { IWorkerThreadManager } from "../interfaces/application/workers/IWorkerThreadManager.js";
import { RedisClient } from "../../infra/databases/connections/redis/RedisConnect.js";
import { TQueueMessage } from "../interfaces/application/aws/sqs/TQueueMessage.js";
import util from 'util'

export class ProcessManager {
  // private workerThreadManager: IWorkerThreadManager,
  constructor(
    private queue: IQueue
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

    const packagesToProcess = new Array()
    for (const { keyGroup, packageIndex}  of [...packagesExpired, ...packageAlredyFoProcess]) {
      packagesToProcess.push(this.queue.getAndUpdateStatusPackagesToProcessing(keyGroup, packageIndex))
    }

    if (packagesToProcess.length === 0) return

    console.log("AQUI - WORKER", packagesToProcess)
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
