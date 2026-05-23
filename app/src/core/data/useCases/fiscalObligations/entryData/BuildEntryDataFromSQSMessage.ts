import { E_OBRIGACOES } from "../../../../domain/fiscalObligations/names.js"
import { TFiscalObligationsEntryData, E_DATA_FROM } from "../../../../domain/fiscalObligations/TFiscalObligationsEntryData.js"
import { IBuildEntryData } from "../../../../domain/IBuildEntryData.js"
import { TQueueMessage } from "../../../interfaces/application/queue/TQueueMessage.js"


export class BuildEntryDataFromSQSMessage implements IBuildEntryData<TQueueMessage, TFiscalObligationsEntryData> {
  public async handle(data: TQueueMessage): Promise<TFiscalObligationsEntryData | Error> {
    try {
      if (!data.body) return new Error('O corpo da mensagem nao foi informado')
      const messageBody = JSON.parse(data.body)

      if (messageBody.obrigacao === E_OBRIGACOES.EFINANCEIRA){
        return this.handleToBuildEntryDataToEfinanceira(data, messageBody)
      }

      throw new Error('Existe um layout que não foi implementado.')
    } catch(error) {
      return new Error('Dados informador invalidos')
    }
  }

  private handleToBuildEntryDataToEfinanceira(data: TQueueMessage, message: any): TFiscalObligationsEntryData {
    return {
      from: {
        identifier: E_DATA_FROM.SQS,
        sqs: {
          messageId: data.messageId,
          receiptId: data.receiptId
        }
      },
      event: {
        obrigacao: message.obrigacao,
        efinanceira: {
          cnpjEmpresa: message.cnpjEmpresa,
          idGov: message.id,
          ano: message.ano,
          mes: message.mes,
          anoMes: (message.ano * 100) + message.mes,
          codLayout: message.codLayout,
          evento: message.evento
        }
      }
    }
  }
}