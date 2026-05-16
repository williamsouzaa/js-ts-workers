import { TEventDetails } from "../../../../domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { IWritefiscalOBligationsPackageRepository } from "../../../../domain/fiscalObligations/repositories/IWriteFiscalOBligartionsPackageRepository.js"
import { RedisClient } from "../../connections/redis/RedisConnect.js"

export class RedisfiscalOBligationsPackageRepositoryAdapter implements IWritefiscalOBligationsPackageRepository {
  public async writePackage(redisPackage: Array<{entryDataString: string, eventDetails: TEventDetails}>): Promise<void> {
    try {
      const pipeline = RedisClient.client.multi()
      const redisEntryData: Record<string, Record<string, string>> = {}
      const redisIndexKeysEntryData: Record<string, Set<string>> = {}

      for (const { eventDetails, entryDataString } of redisPackage) {
        if (!Object.hasOwn(redisIndexKeysEntryData, `${eventDetails.keyGroup}#ENTRY_DATA#PACKAGE#INDEX`)) {
          redisIndexKeysEntryData[`${eventDetails.keyGroup}#ENTRY_DATA#PACKAGE#INDEX`] = new Set<string>()
        }
        redisIndexKeysEntryData[`${eventDetails.keyGroup}#ENTRY_DATA#PACKAGE#INDEX`]!.add(eventDetails.package.lastPackageId.toString())

        const redisEntryDataKey: string = `${eventDetails.keyGroup}#ENTRY_DATA#PACKAGE#${eventDetails.package.lastPackageId}`
        if (!Object.hasOwn(redisEntryData, redisEntryDataKey)) {
          redisEntryData[redisEntryDataKey] = {}
        }

        redisEntryData[redisEntryDataKey]![eventDetails.package.eventId] = entryDataString
      }

      Object.entries(redisIndexKeysEntryData).forEach(([key, value]) => {if (value.size > 0) pipeline.sAdd(key, [...value])});
      Object.entries(redisEntryData).forEach(([key, value]) => {if (Object.keys(value).length > 0) pipeline.hSet(key, value)} );

      await pipeline.exec();
    } catch(error) {
      console.log('[LOG][ERROR] - RedisfiscalOBligationsPackageRepositoryAdapter: ', error)
    }
  }
}