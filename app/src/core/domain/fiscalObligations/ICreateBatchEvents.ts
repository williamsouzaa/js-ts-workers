export interface ICreateBatchEvents<T> {
  handle(data: T): Promise<string>
}