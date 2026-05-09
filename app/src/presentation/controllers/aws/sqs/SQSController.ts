import { IGetBatchMessagesInQueue } from "../../../../data/interfaces/application/aws/sqs/IGetBatchMessagesInQueue.js";
import { TQueueMessage } from "../../../../data/interfaces/application/aws/sqs/TQueueMessage.js";
import { ProcessManager } from "../../../../data/useCases/ProcessManager.js";
import { IBuildEntryData } from "../../../../domain/useCases/data/IBuildEntryData.js";
import { IQueueController, EQueueController } from "../../../interfaces/IQueueController.js";


export class SQSController implements IQueueController {
  public indentifier: EQueueController = EQueueController.AWS_SQS;

  constructor(
    private getBatchMessagesInQueue: IGetBatchMessagesInQueue,
    private buildEntryData: IBuildEntryData<TQueueMessage>,
    private processManager: ProcessManager
  ) {}

  public async handle(): Promise<void> {
    try {
      const messages = await this.getBatchMessagesInQueue.getBatchMessages(5)
      if(!messages) return

      console.log(`[LOG] - SQSController - handle - messages recebidas: ${messages.length}`)

      const entryDataList = new Array()
      for (const message of messages) {
        const entryData = await this.buildEntryData.handle(message)
        if (entryData instanceof Error) {
          console.log('[LOG][ERROR] - SQSController - handle - message: ', message)
          continue
        }
        entryDataList.push(entryData)
      }

      await this.processManager.handle(entryDataList)
    } catch (error) {
      console.log('[LOG][ERROR] - SQSController - handle - erro: ', error)
    }
  }
}