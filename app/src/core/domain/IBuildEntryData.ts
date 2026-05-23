export interface IBuildEntryData<I, T> {
  handle(data: I): Promise<T | Error>
}
