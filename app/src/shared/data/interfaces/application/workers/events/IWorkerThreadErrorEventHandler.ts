export interface IWorkerThreadErrorEventHandler {
  handle(erro: Error): Promise<void>
}