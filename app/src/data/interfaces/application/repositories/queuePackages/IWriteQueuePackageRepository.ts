import { TRawEntryData, TReceived } from "../../../../../domain/useCases/data/TEntryData.js";
import { TQueueAddItemResponse } from "../../queue/IQueue.js";

export interface IWriteQueuePackageRepository {
  writePackage(packageData: Array<{rawEntryData: TRawEntryData, received: TReceived, queueResponse: TQueueAddItemResponse}>): Promise<void>
}