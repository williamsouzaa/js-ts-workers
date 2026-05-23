import { IWorkerErrorEventHandler } from "../../../../../core/data/interfaces/application/workers/events/IWorkerErrorEventHandler.js";
import { IWorkerExitEventHandler } from "../../../../../core/data/interfaces/application/workers/events/IWorkerExitEventHandler.js";
import { IWorkerSuccessEventHandler } from "../../../../../core/data/interfaces/application/workers/events/IWorkerSuccessEventHandler.js";
import { AWorker } from "../../../../../core/data/useCases/application/workers/AWorker.js";
import { TFiscalObligationsEntryData } from "../../../../domain/fiscalObligations/TFiscalObligationsEntryData.js";

export class WorkerFiscalObligations extends AWorker<TFiscalObligationsEntryData> {
    constructor(
      sucessEventHandler: IWorkerSuccessEventHandler<TFiscalObligationsEntryData>,
      errorEventHandler: IWorkerErrorEventHandler,
      exitEventHandler: IWorkerExitEventHandler
    ) {
      super( sucessEventHandler, errorEventHandler, exitEventHandler)
    }
  }
