import { IDeleteBatchMessagesInQueue } from "../../../../../data/interfaces/application/aws/sqs/IDeleteBatchMessagesInQueue.js";
import { IGetBatchMessagesInQueue } from "../../../../../data/interfaces/application/aws/sqs/IGetBatchMessagesInQueue.js";
import { TQueueMessage } from "../../../../../data/interfaces/application/aws/sqs/TQueueMessage.js";
import { ProcessManager } from "../../../../../data/useCases/ProcessManager.js";
import { EBusinessRuleIdentifier, TBusinessRule, TBusinessRuleEvent } from "../../../../../domain/useCases/names/dataInput/TBusinessRule.js";
import { EObrigacaoCodigoLayout } from "../../../../../domain/useCases/names/EObrigacaoCodigoLayout.js";
import { EObrigacaoLayout } from "../../../../../domain/useCases/names/EObrigacaoLayout.js";
import { sleep } from "../../../../../utils/sleep.js";
import { EQueueController, IQueueController } from "../../../../interfaces/IQueueController.js";



export class SQSController implements IQueueController {
  public indentifier: EQueueController = EQueueController.AWS_SQS;
  manager: ProcessManager

  constructor(
    private getBatchMessagesInQueue: IGetBatchMessagesInQueue,
    private deleteBatchMessagesInQueue: IDeleteBatchMessagesInQueue
  ){
    this.manager = new ProcessManager()
  }

  public async handle(): Promise<void> {
    try {
      const messages = await this.getBatchMessagesInQueue.getBatchMessages(5)
      if(!messages) return

      for (const message of messages) {
        const businessRule = this.buildBusinessRule(message)
        if (!businessRule) continue

        await this.manager.handle(businessRule)

      }
      sleep(10000)
    } catch (error) {
      console.log('[LOG][ERROR] - SQSController - handle - erro: ', error)
    }
  }

  private buildBusinessRule(message: TQueueMessage): TBusinessRule | undefined {
    if (!message.body) return
    const body = JSON.parse(message.body)
    return {
      identifier: EBusinessRuleIdentifier.AWS_SQS,
      event: {
        id: body.id,
        obrigacao: body.obrigacao,
        layout: body.layout as EObrigacaoLayout,
        codigoLayout: body.codLayout as EObrigacaoCodigoLayout,
        anoObrigacao: parseInt(body.anoObrigacao, 10),
        mesObrigacao: !!body.mesObrigacao ? parseInt(body.mesObrigacao, 10) : undefined,
        diaObrigacao: !!body.diaObrigacao ? parseInt(body.diaObrigacao, 10) : undefined,
        cnpjEmpresa: body.cnpjEmpresa,
        jsonStr: body.evento,
      },
      sqs: {
        messageId: message.messageId,
        receiptId: message.receiptId
      }
    }
  }
}