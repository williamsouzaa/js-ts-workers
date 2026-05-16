import { IWorkerThreadExitEventHandler } from "../../../../../interfaces/application/workers/events/IWorkerThreadExitEventHandler.js";


export class WorkerThreadExitEventHandler implements IWorkerThreadExitEventHandler {
  public async handle(code: number): Promise<void> {
    console.log("WorkerThreadExitEventHandler handle: ", code)
  }
}