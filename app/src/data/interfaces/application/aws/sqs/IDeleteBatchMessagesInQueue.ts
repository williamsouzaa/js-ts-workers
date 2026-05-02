import { TQueueMessage } from "./TQueueMessage.js";

export type TParamDeleteBatchMessagesInQueue = {
  messageId: string
  receiptId: string
}

export interface IDeleteBatchMessagesInQueue {
  deleteMessagesBatch(messagesToDelete: Array<TParamDeleteBatchMessagesInQueue>): Promise<void | Error>
}