import { IObjectToXsdMapper } from "../../../../../core/domain/fiscalObligations/IObjectToXsdMapper.js"
import { E_OBRIGACOES_CODIGO_LAYOUT } from "../../../../../core/domain/fiscalObligations/names.js"
import { TEventEfinanceira } from "../../../../../core/domain/fiscalObligations/TFiscalObligationsEntryData.js"

export class ObjectToXsdMapperEfinanceiraAbertura implements IObjectToXsdMapper<TEventEfinanceira> {
  layoutCode = E_OBRIGACOES_CODIGO_LAYOUT.EFINANCEIRA_ABERTURA

  public async handle(data: TEventEfinanceira): Promise<Record<string, any>> {
    throw new Error('ObjectToXsdMapperEfinanceiraAbertura.handle should be implemented')
  }
}