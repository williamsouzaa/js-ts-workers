import { FiscalOBligationsOrchestrator } from "../../../../../modules/fiscalOBligations/data/useCases/FiscalObligartionsOrchestrator.js";
import { TFiscalOBligationsEntryData } from "../../../../../modules/fiscalOBligations/domain/contracts/TFiscalOBligartionsEntryData.js";
import { IGetBatchMessagesInQueue } from "../../../../data/interfaces/application/queue/IGetBatchMessagesInQueue.js";
import { TQueueMessage } from "../../../../data/interfaces/application/queue/TQueueMessage.js";
import { IBuildEntryData } from "../../../../domain/buildEntryData/IBuildEntryData.js";

import { IQueueController, EQueueController } from "../../../interfaces/queue/IQueueController.js";

export class SQSController implements IQueueController {
  public indentifier: EQueueController = EQueueController.AWS_SQS;

  constructor(
    private getBatchMessagesInQueue: IGetBatchMessagesInQueue,
    private buildEntryData: IBuildEntryData<TQueueMessage, TFiscalOBligationsEntryData>,
    private fiscalOBligationsOrchestrator: FiscalOBligationsOrchestrator
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

      await this.fiscalOBligationsOrchestrator.handle(entryDataList)
    } catch (error) {
      console.log('[LOG][ERROR] - SQSController - handle - erro: ', error)
    }
  }
}