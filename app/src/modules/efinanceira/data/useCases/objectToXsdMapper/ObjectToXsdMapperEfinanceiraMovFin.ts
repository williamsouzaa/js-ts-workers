import { IObjectToXsdMapper } from "../../../../../core/domain/fiscalObligations/IObjectToXsdMapper.js"
import { E_OBRIGACOES, E_OBRIGACOES_CODIGO_LAYOUT } from "../../../../../core/domain/fiscalObligations/names.js"
import { TEventEfinanceira } from "../../../../../core/domain/fiscalObligations/TFiscalObligationsEntryData.js"
import { EFINANCEIRA } from "../../../../../environment.js"


export class ObjectToXsdMapperEfinanceiraMovFin implements IObjectToXsdMapper<TEventEfinanceira> {
  layoutCode = E_OBRIGACOES_CODIGO_LAYOUT.EFINANCEIRA_MOVIMENTACAO_FINANCEIRA

  public async handle(data: TEventEfinanceira): Promise<Record<string, any>> {
    data.evento.eFinanceira['@xmlns'] = 'http://www.eFinanceira.gov.br/schemas/evtMovOpFin/v1_3_0'
    data.evento.eFinanceira.evtMovOpFin['@id'] = data.idGov
    return data.evento
  }
}