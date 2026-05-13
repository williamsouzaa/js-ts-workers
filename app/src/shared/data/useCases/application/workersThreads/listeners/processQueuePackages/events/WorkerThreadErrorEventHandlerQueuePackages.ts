import { IWorkerThreadErrorEventHandler } from "../../../../../../interfaces/application/workers/events/IWorkerThreadErrorEventHandler.js";

export class WorkerThreadErrorEventHandlerQueuePackages implements IWorkerThreadErrorEventHandler {
  public async handle(message: any): Promise<void> {
    console.log("WorkerThreadErrorEventHandler handle: ", message)
  }
}