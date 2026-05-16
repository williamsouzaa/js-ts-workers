import { TQueueMessage } from "../../../../shared/data/interfaces/application/queue/TQueueMessage.js"
import { E_OBRIGACAO_CODIGO_LAYOUT, E_OBRIGACAO } from "../names.js"

export enum E_DATA_FROM {
  SQS = 'sqs'
}

export type TEventReinf = any
export type TEventEsocial = any
export type TEventNFSe = any

export type TEventEfinanceira = {
  cnpjEmpresa: string
  ano: number
  mes: number
  anoMes: number
  codLayout: E_OBRIGACAO_CODIGO_LAYOUT
  idGov: string
  evento: any
}

export type TFiscalOBligationsEntryData = {
  from: {
    identifider: E_DATA_FROM
    sqs?: Omit<TQueueMessage, 'body'>
  }
  event: {
    obrigacao: E_OBRIGACAO
    efinanceira?: TEventEfinanceira
    reinf?: TEventReinf
    esocial?: TEventEsocial
    nfse?: TEventNFSe
  }
}
