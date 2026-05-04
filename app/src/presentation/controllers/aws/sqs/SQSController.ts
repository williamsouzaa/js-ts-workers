import { IGetBatchMessagesInQueue } from "../../../../data/interfaces/application/aws/sqs/IGetBatchMessagesInQueue.js";
import { ProcessManager } from "../../../../data/useCases/ProcessManager.js";
import { EReceivedFrom, TEntryData } from "../../../../domain/useCases/data/TEntryData.js";
import { EObrigacaoLayout, EObrigacaoCodigoLayout } from "../../../../domain/useCases/names/index.js";

import { IQueueController, EQueueController } from "../../../interfaces/IQueueController.js";




export class SQSController implements IQueueController {
  public indentifier: EQueueController = EQueueController.AWS_SQS;

  constructor(
    private getBatchMessagesInQueue: IGetBatchMessagesInQueue,
    private processManager: ProcessManager
  ) {}

  public async handle(): Promise<void> {
    try {
      const messages = await this.getBatchMessagesInQueue.getBatchMessages(5)
      if(!messages) return

      console.log(`[LOG] - SQSController - handle - messages recebidas: ${messages.length}`)

      const dataEntryList = new Array()
      for (const message of messages) {
        if (!message.body) continue
        const entryData = this.buildEntryData(JSON.parse(message.body))

        if (entryData instanceof Error) {
          console.log('[LOG][ERROR] - SQSController - handle - message: ', message)
          continue
        }

        dataEntryList.push({
          entryData,
          rawEntryData: message.body,
          received: {
            identifier: EReceivedFrom.AWS_SQS,
            sqs: {
              messageId: message.messageId,
              receiptId: message.receiptId
            }
          }
        })
      }

      await this.processManager.handle(dataEntryList)
    } catch (error) {
      console.log('[LOG][ERROR] - SQSController - handle - erro: ', error)
    }
  }

  private buildEntryData(data: any): TEntryData | Error {
    try {
      return {
        event: {
          id: data.id,
          obrigacao: data.obrigacao,
          layout: data.layout as EObrigacaoLayout,
          codigoLayout: data.codLayout as EObrigacaoCodigoLayout,
          anoObrigacao: parseInt(data.anoObrigacao, 10),
          mesObrigacao: !!data.mesObrigacao ? parseInt(data.mesObrigacao, 10) : undefined,
          diaObrigacao: !!data.diaObrigacao ? parseInt(data.diaObrigacao, 10) : undefined,
          cnpjEmpresa: data.cnpjEmpresa,
        },
        rawData: data.evento
      }
    } catch(error) {
      console.log(error)
      return new Error('Erro no metodo o buildEntryData')
    }
  }
}