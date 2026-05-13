export interface IWorkerThreadListener {
  handle(): Promise<void>
}