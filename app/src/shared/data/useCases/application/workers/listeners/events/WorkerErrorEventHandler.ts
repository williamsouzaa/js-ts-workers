import { IWorkerErrorEventHandler } from "../../../../../interfaces/application/workers/events/IWorkerErrorEventHandler.js";

export class WorkerErrorEventHandler implements IWorkerErrorEventHandler {
  public async handle(erro: Error): Promise<void> {
    console.log("WorkerErrorEventHandler handle: ", erro)
  }
}