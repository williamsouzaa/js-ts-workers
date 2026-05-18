import { SQSClient, ReceiveMessageCommand, ReceiveMessageCommandOutput, DeleteMessageBatchCommand } from "@aws-sdk/client-sqs";
import { IDeleteBatchMessagesInQueue, TParamDeleteBatchMessagesInQueue } from "../../../../data/interfaces/application/queue/IDeleteBatchMessagesInQueue.js";
import { IGetBatchMessagesInQueue } from "../../../../data/interfaces/application/queue/IGetBatchMessagesInQueue.js";
import { TQueueMessage } from "../../../../data/interfaces/application/queue/TQueueMessage.js";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import https from "https";
import http from "http";

export class SQSClientAdapter implements IGetBatchMessagesInQueue, IDeleteBatchMessagesInQueue {
  private awsClientSQS!: SQSClient
  private awsSQSQueueUrl!: string

  public setAWSClientSQS(maxSockets: number = 50): void {
    this.awsClientSQS =  new SQSClient({
      region: "us-east-1",
      endpoint: process.env.AWS_SQS_QUEUE_ENDPOINT_EFINANCEIRA as string,
      credentials: {
        accessKeyId: "test",
        secretAccessKey: "test"
      },
      requestHandler:  new NodeHttpHandler({
        httpsAgent: new https.Agent({
          maxSockets,
          keepAlive: true
        }),
        httpAgent: new http.Agent({
          maxSockets,
          keepAlive: true
        })
      })
    })
  }

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
            VisibilityTimeout: 60 * 5,
            WaitTimeSeconds: 20
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
    if (!messagesToDelete || messagesToDelete.length === 0) return;

    const batchesOfTen: Array<Array<TParamDeleteBatchMessagesInQueue>> = [];
    for (let index = 0; index < messagesToDelete.length; index += 10) {
      batchesOfTen.push(messagesToDelete.slice(index, index + 10));
    }

    const MAX_CONCURRENT_REQUESTS = 50;
    let hasError = false;

    for (let i = 0; i < batchesOfTen.length; i += MAX_CONCURRENT_REQUESTS) {
      const currentConcurrentBatches = batchesOfTen.slice(i, i + MAX_CONCURRENT_REQUESTS);

      const promisesDeDelecao = currentConcurrentBatches.map(async (batchMessage) => {
        const entries = batchMessage.map((msg) => ({
          Id: msg.messageId,
          ReceiptHandle: msg.receiptId
        }));

        try {
          const command = new DeleteMessageBatchCommand({
            QueueUrl: this.awsSQSQueueUrl,
            Entries: entries,
          });

          const response = await this.awsClientSQS.send(command);

          if (response.Failed && response.Failed.length > 0) {
            response.Failed.forEach(falha => {
               console.log(`[LOG][FAILED] - SQS falhou ao deletar MsgId: ${falha.Id} - Motivo: ${falha.Message}`);
            });
            hasError = true;
          }

        } catch (error) {
          console.error("[LOG][ERROR] - SQSClientAdapter - Falha na requisição de delete:", error);
          hasError = true;
        }
      });

      await Promise.all(promisesDeDelecao);
    }
    if (hasError) {
      return new Error('Ocorreram erros parciais ou totais ao deletar os lotes. Verifique os logs.');
    }
  }
}