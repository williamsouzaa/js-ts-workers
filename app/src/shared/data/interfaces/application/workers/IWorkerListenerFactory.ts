export interface IWorkerListenerFactory {
  handle(): Promise<void>
}