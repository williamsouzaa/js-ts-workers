import { SQSClient, ReceiveMessageCommand, ReceiveMessageCommandOutput, DeleteMessageBatchCommand } from "@aws-sdk/client-sqs";
import { IGetBatchMessagesInQueue } from "../../../../data/interfaces/application/aws/sqs/IGetBatchMessagesInQueue.js";
import { TQueueMessage } from "../../../../data/interfaces/application/aws/sqs/TQueueMessage.js";
import { IDeleteBatchMessagesInQueue, TParamDeleteBatchMessagesInQueue } from "../../../../data/interfaces/application/aws/sqs/IDeleteBatchMessagesInQueue.js";


export class SQSClientAdapter implements IGetBatchMessagesInQueue, IDeleteBatchMessagesInQueue {
  awsClientSQS!: SQSClient
  awsSQSQueueUrl!: string

  public setAWSClientSQS(client: SQSClient): void { this.awsClientSQS = client }
  public setAWSSQSQueueUrl(data: string): void { this.awsSQSQueueUrl = data }

  async getBatchMessages(batchNumberMessages: number): Promise<Array<TQueueMessage> | null> {
    try {
      const numberTimesToCall = Math.ceil(batchNumberMessages / 10);

      const functionsList: ReceiveMessageCommand[] = [];
      for (let i = 0; i < numberTimesToCall; i++) {
        functionsList.push(
          new ReceiveMessageCommand({
            QueueUrl: this.awsSQSQueueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 5
          })
        );
      }

      const awsSQSResponse = await Promise.all(
        functionsList.map(func => this.awsClientSQS.send(func) as Promise<ReceiveMessageCommandOutput>)
      );

      const messages = awsSQSResponse.flatMap(res => res.Messages ?? []);

      const queueMessage: Array<TQueueMessage> = messages.map(el => ({
        body: el.Body,
        messageId: el.MessageId!,
        receiptId: el.ReceiptHandle!
      }));

      return queueMessage.length === 0 ? null : queueMessage;
    } catch (error) {
      console.error("[LOG][ERROR] - SQSClientAdapter - getBatchMessages: ", error);
      return null;
    }
  }

  public async deleteMessagesBatch(messagesToDelete: Array<TParamDeleteBatchMessagesInQueue>): Promise<void | Error> {
    const batchOfTenMessages: Array<Array<TParamDeleteBatchMessagesInQueue>> = new Array()
    for (let index = 0; index < messagesToDelete.length; index++) {
      batchOfTenMessages.push(messagesToDelete.slice(index, index + 10))
    }

    for (const batchMessage of batchOfTenMessages) {
      if (messagesToDelete.length === 0 || messagesToDelete.length > 10) {
        throw new Error("O lote de deleção deve ter entre 1 e 10 mensagens.");
      }

      const entries = batchMessage.map((msg) => ({
        Id: msg.messageId,
        ReceiptHandle: msg.receiptId
      }))

      try {
        const command = new DeleteMessageBatchCommand({
          QueueUrl: this.awsSQSQueueUrl,
          Entries: entries,
        });

        const response = await this.awsClientSQS.send(command)

        if (response.Failed && response.Failed.length > 0) {
          for (const el in response.Failed) {
            console.log('[LOG][FAILED] - deleteMessagesBatch - response.Failed - el: ', el)
          }
          return new Error('Erro ao tentar deletar mensagens')
        }

        if (response.Successful && response.Successful.length > 0) return

        return new Error('Error ao deletar batch de mensagens')
      } catch (error) {
        console.error("[LOG][ERROR] - SQSClientAdapter - deleteMessagesBatch - error:", error);
        return new Error('Error ao deletar batch de mensagens')
      }
    }
  }
}