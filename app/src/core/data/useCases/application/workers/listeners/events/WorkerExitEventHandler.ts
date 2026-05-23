import { IWorkerExitEventHandler } from "../../../../../interfaces/application/workers/events/IWorkerExitEventHandler.js";


export class WorkerExitEventHandler implements IWorkerExitEventHandler {
  public async handle(code: number): Promise<void> {
    console.log("WorkerExitEventHandler handle: ", code)
  }
}