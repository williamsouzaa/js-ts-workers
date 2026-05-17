export interface IWorkerListener {
  handle(): Promise<void>
}