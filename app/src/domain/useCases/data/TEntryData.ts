import { EntryType } from "node:perf_hooks"
import { EObrigacao } from "../names/EObrigacao.js"
import { EObrigacaoCodigoLayout } from "../names/EObrigacaoCodigoLayout.js"
import { EObrigacaoLayout } from "../names/EObrigacaoLayout.js"

export type TReceivedSQS = {
  messageId: string
  receiptId: string
}

export enum EReceivedFrom {
  AWS_SQS = 'AWS_SQS'
}

export type TTEntryDataEvent = {
  id: string
  obrigacao: EObrigacao,
  layout: EObrigacaoLayout,
  codigoLayout: EObrigacaoCodigoLayout,
  anoObrigacao: number,
  mesObrigacao?: number | undefined,
  diaObrigacao?: number | undefined,
  cnpjEmpresa: string,
}


export type TRawEntryData = string

export type TEntryData = {
  event: TTEntryDataEvent
  rawData: TRawEntryData
}

export type TReceived = {
  from: EReceivedFrom,
  sqs: TReceivedSQS
}


export type TEntryDataReceived = {
  entryData: TEntryData
  rawEntryData: TRawEntryData
  received: TReceived
}