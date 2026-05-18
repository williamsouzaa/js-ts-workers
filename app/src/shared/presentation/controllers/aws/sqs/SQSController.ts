import { IGetBatchMessagesInQueue } from "../../../../data/interfaces/application/queue/IGetBatchMessagesInQueue.js";
import { TQueueMessage } from "../../../../data/interfaces/application/queue/TQueueMessage.js";
import { FiscalOBligationsOrchestrator } from "../../../../data/useCases/fiscalObligations/FiscalObligationsOrchestrator.js";
import { TFiscalOBligationsEntryData } from "../../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js";
import { IBuildEntryData } from "../../../../domain/IBuildEntryData.js";
import { IQueueController, EQueueController } from "../../../interfaces/queue/IQueueController.js";

export class SQSController implements IQueueController {
  public indentifier: EQueueController = EQueueController.AWS_SQS;

  constructor(
    private getBatchMessagesInQueue: IGetBatchMessagesInQueue,
    private buildEntryData: IBuildEntryData<TQueueMessage, TFiscalOBligationsEntryData>,
    private fiscalOBligationsOrchestrator: FiscalOBligationsOrchestrator
  ) {}

  public async handle(): Promise<void> {
    const messages = await this.getBatchMessagesInQueue.getBatchMessages(1000)
    try {
      if(!messages) return

      console.log(`[LOG] - SQSController - handle - messages recebidas: ${messages.length} -> ${new Date()}`)

      const entryDataList = new Array()
      for (const message of messages) {
        const entryData = await this.buildEntryData.handle(message)
        if (entryData instanceof Error) {
          console.log('[LOG][ERROR] - SQSController - handle - message: ', message)
          continue
        }
        entryDataList.push(entryData)
      }

      await this.fiscalOBligationsOrchestrator.handle(entryDataList)
    } catch (error) {
      console.log('[LOG][ERROR] - SQSController - handle - messages: ', messages)
      console.log('[LOG][ERROR] - SQSController - handle - erro: ', error)
    }
  }
}