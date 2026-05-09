import { TEntryData } from "../../../../../domain/useCases/data/TEntryData.js";
import { TQueueAddItemResponse } from "../../queue/IQueue.js";

export interface IWriteQueuePackageRepository {
  writePackage(packageData: Array<{entryDataString: string, queueResponse: TQueueAddItemResponse}>): Promise<void>
}