import { IGetBatchMessagesInQueue } from "../../../../data/interfaces/application/queue/IGetBatchMessagesInQueue.js";
import { TQueueMessage } from "../../../../data/interfaces/application/queue/TQueueMessage.js";
import { FiscalObligationsOrchestrator } from "../../../../data/useCases/fiscalObligations/FiscalObligationsOrchestrator.js";
import { TFiscalObligationsEntryData } from "../../../../domain/fiscalObligations/TFiscalObligationsEntryData.js";
import { IBuildEntryData } from "../../../../domain/IBuildEntryData.js";
import { IQueueController, EQueueController } from "../../../interfaces/queue/IQueueController.js";
import { sleep } from "../../../../../utils/sleep.js";

export class SQSController implements IQueueController {
  public identifier: EQueueController = EQueueController.AWS_SQS;

  constructor(
    private getBatchMessagesInQueue: IGetBatchMessagesInQueue,
    private buildEntryData: IBuildEntryData<TQueueMessage, TFiscalObligationsEntryData>,
    private fiscalObligationsOrchestrator: FiscalObligationsOrchestrator
  ) {}

  public async handle(): Promise<void> {
    if (!this.fiscalObligationsOrchestrator.hasCapacity()) {
      await sleep(500)
      return
    }

    const messages = await this.getBatchMessagesInQueue.getBatchMessages(2000)
    try {
      if (!messages) return

      console.log(`[LOG] - SQSController - handle - messages recebidas: ${messages.length} -> ${new Date()}`)

      const buildPromises: Array<Promise<TFiscalObligationsEntryData | Error>> = []
      for (const message of messages) {
        buildPromises.push(this.buildEntryData.handle(message))
      }
      const buildResults = await Promise.all(buildPromises)

      const entryDataList: Array<TFiscalObligationsEntryData> = []
      for (const result of buildResults) {
        if (result instanceof Error) {
          console.log('[LOG][ERROR] - SQSController - handle - message could not be parsed:', result.message)
          continue
        }
        entryDataList.push(result)
      }

      // await this.fiscalObligationsOrchestrator.handle(entryDataList)
    } catch (error) {
      console.log('[LOG][ERROR] - SQSController - handle - messages: ', messages)
      console.log('[LOG][ERROR] - SQSController - handle - erro: ', error)
    }
  }
}
