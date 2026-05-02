import { EObrigacao } from "../EObrigacao.js"
import { EObrigacaoCodigoLayout } from "../EObrigacaoCodigoLayout.js"
import { EObrigacaoLayout } from "../EObrigacaoLayout.js"

export type TBusinessRuleSQS = {
  messageId: string
  receiptId: string
}

export enum EBusinessRuleIdentifier {
  AWS_SQS = 'AWS_SQS'
}

export type TBusinessRuleEvent = {
  id: string
  obrigacao: EObrigacao,
  layout: EObrigacaoLayout,
  codigoLayout: EObrigacaoCodigoLayout,
  anoObrigacao: number,
  mesObrigacao?: number | undefined,
  diaObrigacao?: number | undefined,
  cnpjEmpresa: string,
  jsonStr: string,
}

export type TBusinessRule = {
  identifier: EBusinessRuleIdentifier
  event: TBusinessRuleEvent
  sqs: TBusinessRuleSQS
}