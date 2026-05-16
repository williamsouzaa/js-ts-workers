import { IWorkerThreadErrorEventHandler } from "../../../../../interfaces/application/workers/events/IWorkerThreadErrorEventHandler.js";

export class WorkerThreadErrorEventHandler implements IWorkerThreadErrorEventHandler {
  public async handle(erro: Error): Promise<void> {
    console.log("WorkerThreadErrorEventHandler handle: ", erro)
  }
}