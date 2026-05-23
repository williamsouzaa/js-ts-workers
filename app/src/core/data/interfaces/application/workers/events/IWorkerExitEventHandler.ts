export interface IWorkerExitEventHandler {
  handle(code: number): Promise<void>
}