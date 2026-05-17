import { IWorkerErrorEventHandler } from "../../../../../shared/data/interfaces/application/workers/events/IWorkerErrorEventHandler.js";
import { IWorkerExitEventHandler } from "../../../../../shared/data/interfaces/application/workers/events/IWorkerExitEventHandler.js";
import { IWorkerSucessEventHandler } from "../../../../../shared/data/interfaces/application/workers/events/IWorkerSucessEventHandler.js";
import { AWorker } from "../../../../../shared/data/useCases/application/workers/AWorker.js";
import { TFiscalOBligationsEntryData } from "../../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js";

export class WorkerFiscalOBligations extends AWorker<TFiscalOBligationsEntryData> {
    constructor(
      sucessEventHandler: IWorkerSucessEventHandler<TFiscalOBligationsEntryData>,
      errorEventHandler: IWorkerErrorEventHandler,
      exitEventHandler: IWorkerExitEventHandler
    ) {
      super( sucessEventHandler, errorEventHandler, exitEventHandler)
    }
  }
