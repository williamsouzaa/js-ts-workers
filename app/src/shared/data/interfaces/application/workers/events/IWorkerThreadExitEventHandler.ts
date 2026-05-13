export interface IWorkerThreadExitEventHandler {
  handle(code: number): Promise<void>
}