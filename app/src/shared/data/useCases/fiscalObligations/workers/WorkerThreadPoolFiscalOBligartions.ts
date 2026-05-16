import { IWorkerThread } from "../../../../../shared/data/interfaces/application/workers/IWorkerThread.js";
import { IWorkerThreadPool } from "../../../../../shared/data/interfaces/application/workers/IWorkerThreadPool.js";
import { AWorkerThreadPool } from "../../../../../shared/data/useCases/application/workersThreads/AWorkerThreadPool.js";
import { TFiscalOBligationsEntryData } from "../../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js";

export class WorkerThreadPoolFiscalOBligations extends AWorkerThreadPool<TFiscalOBligationsEntryData> {
  constructor(workerThreadFactory: () => IWorkerThread<TFiscalOBligationsEntryData>) {
    super(workerThreadFactory)
  }
}
