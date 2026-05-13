import { IWorkerThreadExitEventHandler } from "../../../../../../interfaces/application/workers/events/IWorkerThreadExitEventHandler.js";

export class WorkerThreadExitEventHandlerQueuePackages implements IWorkerThreadExitEventHandler {
  public async handle(message: any): Promise<void> {
    console.log("WorkerThreadExitEventHandler handle: ", message)
  }
}