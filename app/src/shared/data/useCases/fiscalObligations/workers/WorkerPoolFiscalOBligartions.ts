import { IWorker } from "../../../../../shared/data/interfaces/application/workers/IWorker.js";

import { TFiscalOBligationsEntryData } from "../../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js";
import { AWorkersPool } from "../../application/workers/AWorkersPool.js";

export class WorkerPoolFiscalOBligations extends AWorkersPool<TFiscalOBligationsEntryData> {
  constructor(workerThreadFactory: () => IWorker<TFiscalOBligationsEntryData>) {
    super(workerThreadFactory)
  }
}
