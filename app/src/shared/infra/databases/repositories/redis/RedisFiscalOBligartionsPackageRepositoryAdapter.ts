import { TEventDetails, TPackageReference } from "../../../../domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { IDeleteEventsFiscalOBligartionsPackageRepository } from "../../../../domain/fiscalObligations/repositories/IDeleteEventsFiscalOBligartionsPackageRepository.js"
import { IWritefiscalOBligationsPackageRepository } from "../../../../domain/fiscalObligations/repositories/IWriteFiscalOBligartionsPackageRepository.js"
import { RedisClient } from "../../connections/redis/RedisConnect.js"

export class RedisfiscalOBligationsPackageRepositoryAdapter implements IWritefiscalOBligationsPackageRepository, IDeleteEventsFiscalOBligartionsPackageRepository {
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

  public async deleteEvents(packageEventDatail: TPackageReference, eventsIds: Array<string>): Promise<void> {
    try {
      if (!eventsIds || eventsIds.length === 0) return;

      const keyGroup = packageEventDatail.keyGroup;
      const keyPackage = packageEventDatail.packageIndex.toString();

      const hashKey = `${keyGroup}#ENTRY_DATA#PACKAGE#${keyPackage}`;
      const indexKey = `${keyGroup}#ENTRY_DATA#PACKAGE#INDEX`;

      await RedisClient.client.hDel(hashKey, eventsIds);

      const remainingElements = await RedisClient.client.hLen(hashKey);

      if (remainingElements === 0) await RedisClient.client.sRem(indexKey, keyPackage);
    } catch (error) {
      console.log('[LOG][ERROR] - RedisfiscalOBligationsPackageRepositoryAdapter.deleteEvents: ', error);
    }
  }
}