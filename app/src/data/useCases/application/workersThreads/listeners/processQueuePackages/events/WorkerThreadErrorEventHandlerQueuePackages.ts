import { IWorkerThreadErrorEventHandler } from "../../../../../../interfaces/application/workers/IWorkerThreadErrorEventHandler.js";

export class WorkerThreadErrorEventHandlerQueuePackages implements IWorkerThreadErrorEventHandler {
  public async handle(message: any): Promise<void> {
    console.log("WorkerThreadErrorEventHandler handle: ", message)
  }
}