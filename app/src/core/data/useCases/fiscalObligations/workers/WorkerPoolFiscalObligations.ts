import { IWorker } from "../../../../../core/data/interfaces/application/workers/IWorker.js";

import { TFiscalObligationsEntryData } from "../../../../domain/fiscalObligations/TFiscalObligationsEntryData.js";
import { AWorkersPool } from "../../application/workers/AWorkersPool.js";

export class WorkerPoolFiscalObligations extends AWorkersPool<TFiscalObligationsEntryData> {
  constructor(workerThreadFactory: () => IWorker<TFiscalObligationsEntryData>) {
    super(workerThreadFactory)
  }
}
