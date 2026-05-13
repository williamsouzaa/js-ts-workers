import { TQueueMessage } from "../../../../data/interfaces/application/aws/sqs/TQueueMessage.js"
import { E_OBRIGACAO_CODIGO_LAYOUT, E_OBRIGACAO } from "../../names/index.js"


export enum E_ENTRY_DATA_FROM {
  SQS = 'sqs'
}

export type TEntryDataEventReinf = any
export type TEntryDataEventEsocial = any
export type TEntryDataEventNFSe = any

export type TEntryDataEventEfinanceira = {
  cnpjEmpresa: string
  ano: number
  mes: number
  anoMes: number
  codLayout: E_OBRIGACAO_CODIGO_LAYOUT
  idGov: string
  evento: any
}

export type TEntryData = {
  from: {
    identifider: E_ENTRY_DATA_FROM
    sqs?: Omit<TQueueMessage, 'body'>
  }
  event: {
    obrigacao: E_OBRIGACAO
    efinanceira?: TEntryDataEventEfinanceira
    reinf?: TEntryDataEventReinf
    esocial?: TEntryDataEventEsocial
    nfse?: TEntryDataEventNFSe
  }
}
