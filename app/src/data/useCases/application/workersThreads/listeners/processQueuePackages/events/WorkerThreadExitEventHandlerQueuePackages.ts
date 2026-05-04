import { IWorkerThreadExitEventHandler } from "../../../../../../interfaces/application/workers/IWorkerThreadExitEventHandler.js";

export class WorkerThreadExitEventHandlerQueuePackages implements IWorkerThreadExitEventHandler {
  public async handle(message: any): Promise<void> {
    console.log("WorkerThreadExitEventHandler handle: ", message)
  }
}