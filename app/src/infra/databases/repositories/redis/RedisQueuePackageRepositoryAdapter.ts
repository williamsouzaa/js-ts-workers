import { TQueueAddItemResponse } from "../../../../data/interfaces/application/queue/IQueue.js"
import { IWriteQueuePackageRepository } from "../../../../data/interfaces/application/repositories/queuePackages/IWriteQueuePackageRepository.js"
import { TRawEntryData, TReceived } from "../../../../domain/useCases/data/TEntryData.js"
import { RedisClient } from "../../connections/redis/RedisConnect.js"

export class RedisQueuePackageRepositoryAdapter implements IWriteQueuePackageRepository {
  public async writePackage(redisPackage: Array<{rawEntryData: TRawEntryData, received: TReceived, queueResponse: TQueueAddItemResponse}>): Promise<void> {
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
}