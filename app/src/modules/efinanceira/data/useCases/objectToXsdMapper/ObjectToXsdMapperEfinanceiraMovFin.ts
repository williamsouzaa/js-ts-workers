import { IObjectToXsdMapper } from "../../../../../shared/domain/fiscalObligations/IObjectToXsdMapper.js"
import { E_OBRIGACAO_CODIGO_LAYOUT } from "../../../../../shared/domain/fiscalObligations/names.js"
import { TEventEfinanceira } from "../../../../../shared/domain/fiscalObligations/TFiscalOBligartionsEntryData.js"


export class ObjectToXsdMapperEfinanceiraMovFin implements IObjectToXsdMapper<TEventEfinanceira> {
  layoutCode = E_OBRIGACAO_CODIGO_LAYOUT.EFINANCEIRA_MOVIMENTACAO_FINACEIRA

  public async handle(data: TEventEfinanceira): Promise<Record<string, any>> {
    data.evento.eFinanceira['@xmlns'] = 'http://www.eFinanceira.gov.br/schemas/evtMovOpFin/v1_3_0'
    data.evento.eFinanceira.evtMovOpFin['@id'] = data.idGov
    return data.evento
  }
}