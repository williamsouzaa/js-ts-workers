import { TQueueMessage } from "./TQueueMessage.js"

export interface IGetBatchMessagesInQueue {
  getBatchMessages(batchNumberMessages: number): Promise<Array<TQueueMessage> | null>
}
