import { E_OBRIGACOES, E_OBRIGACOES_CODIGO_LAYOUT } from "./names.js"

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
  codLayout: E_OBRIGACOES_CODIGO_LAYOUT
  idGov: string
  evento: any
}

export type TFiscalObligationsEntryData = {
  from: {
    identifier: E_DATA_FROM
    sqs?: { messageId: string; receiptId: string }
  }
  event: {
    obrigacao: E_OBRIGACOES
    efinanceira?: TEventEfinanceira
    reinf?: TEventReinf
    esocial?: TEventEsocial
    nfse?: TEventNFSe
  }
}
