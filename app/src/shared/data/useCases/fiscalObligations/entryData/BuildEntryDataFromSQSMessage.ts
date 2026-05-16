import { E_OBRIGACAO } from "../../../../domain/fiscalObligations/names.js"
import { TFiscalOBligationsEntryData, E_DATA_FROM } from "../../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js"
import { IBuildEntryData } from "../../../../domain/IBuildEntryData.js"
import { TQueueMessage } from "../../../interfaces/application/queue/TQueueMessage.js"


export class BuildEntryDataFromSQSMessage implements IBuildEntryData<TQueueMessage, TFiscalOBligationsEntryData> {
  public async handle(data: TQueueMessage): Promise<TFiscalOBligationsEntryData | Error> {
    try {
      if (!data.body) return new Error('O corpo da mensagem nao foi informado')
      const messageBody = JSON.parse(data.body)

      if (messageBody.obrigacao === E_OBRIGACAO.E_FINANCEIRA){
        return this.handleToBuildEntryDataToEfinanceira(data, messageBody)
      }

      throw new Error('Existe um layout que não foi implementado.')
    } catch(error) {
      return new Error('Dados informador invalidos')
    }
  }

  private handleToBuildEntryDataToEfinanceira(data: TQueueMessage, message: any): TFiscalOBligationsEntryData {
    return {
      from: {
        identifider: E_DATA_FROM.SQS,
        sqs: {
          messageId: data.messageId,
          receiptId: data.receiptId
        }
      },
      event: {
        obrigacao: message.obrigacao as E_OBRIGACAO,
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