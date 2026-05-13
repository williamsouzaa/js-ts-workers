import { TQueueAddItemResponse } from "../../../../data/interfaces/application/queue/IQueue.js"
import { IWriteQueuePackageRepository } from "../../../../data/interfaces/application/repositories/queuePackages/IWriteQueuePackageRepository.js"
import { RedisClient } from "../../connections/redis/RedisConnect.js"

export class RedisQueuePackageRepositoryAdapter implements IWriteQueuePackageRepository {
  public async writePackage(redisPackage: Array<{entryDataString: string, queueResponse: TQueueAddItemResponse}>): Promise<void> {
    const pipeline = RedisClient.client.multi()

    const redisEntryData: Record<string, Record<string, string>> = {}
    const redisIndexKeysEntryData: Record<string, Set<string>> = {}

    for (const { queueResponse, entryDataString } of redisPackage) {
      if (!Object.hasOwn(redisIndexKeysEntryData, `${queueResponse.keyGroup}#ENTRY_DATA#PACKAGE#INDEX`)) {
        redisIndexKeysEntryData[`${queueResponse.keyGroup}#ENTRY_DATA#PACKAGE#INDEX`] = new Set<string>()
      }
      redisIndexKeysEntryData[`${queueResponse.keyGroup}#ENTRY_DATA#PACKAGE#INDEX`]!.add(queueResponse.package.lastPackageId.toString())

      const redisEntryDataKey: string = `${queueResponse.keyGroup}#ENTRY_DATA#PACKAGE#${queueResponse.package.lastPackageId}`
      if (!Object.hasOwn(redisEntryData, redisEntryDataKey)) {
        redisEntryData[redisEntryDataKey] = {}
      }

      redisEntryData[redisEntryDataKey]![queueResponse.package.eventId] = entryDataString
    }

    Object.entries(redisIndexKeysEntryData).forEach(([key, value]) => {if (value.size > 0) pipeline.sAdd(key, [...value])});
    Object.entries(redisEntryData).forEach(([key, value]) => {if (Object.keys(value).length > 0) pipeline.hSet(key, value)} );

    await pipeline.exec();
  }
}