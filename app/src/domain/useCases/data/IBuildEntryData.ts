import { TEntryData } from "./TEntryData.js";

export interface IBuildEntryData<T> {
  handle(data: T): Promise<TEntryData | Error>
}
