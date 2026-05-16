import { IWorkerThreadErrorEventHandler } from "../../../../../shared/data/interfaces/application/workers/events/IWorkerThreadErrorEventHandler.js";
import { IWorkerThreadExitEventHandler } from "../../../../../shared/data/interfaces/application/workers/events/IWorkerThreadExitEventHandler.js";
import { IWorkerThreadSucessEventHandler } from "../../../../../shared/data/interfaces/application/workers/events/IWorkerThreadSucessEventHandler.js";
import { AWorkerThread } from "../../../../../shared/data/useCases/application/workersThreads/AWorkerThread.js";
import { TFiscalOBligationsEntryData } from "../../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js";

export class WorkerThreadFiscalOBligations extends AWorkerThread<TFiscalOBligationsEntryData> {
    constructor(
      sucessEventHandler: IWorkerThreadSucessEventHandler<TFiscalOBligationsEntryData>,
      errorEventHandler: IWorkerThreadErrorEventHandler,
      exitEventHandler: IWorkerThreadExitEventHandler
    ) {
      super( sucessEventHandler, errorEventHandler, exitEventHandler)
    }
  }
