export interface IWorkerErrorEventHandler {
  handle(erro: Error): Promise<void>
}