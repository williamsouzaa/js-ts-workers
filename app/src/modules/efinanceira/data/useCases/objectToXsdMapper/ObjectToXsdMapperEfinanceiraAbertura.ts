import { IObjectToXsdMapper } from "../../../../../shared/domain/fiscalObligations/IObjectToXsdMapper.js"
import { E_OBRIGACAO_CODIGO_LAYOUT } from "../../../../../shared/domain/fiscalObligations/names.js"
import { TEventEfinanceira } from "../../../../../shared/domain/fiscalObligations/TFiscalOBligartionsEntryData.js"

export class ObjectToXsdMapperEfinanceiraAbertura implements IObjectToXsdMapper<TEventEfinanceira> {
  layoutCode = E_OBRIGACAO_CODIGO_LAYOUT.EFINANCEIRA_ABERTURA

  public async handle(data: TEventEfinanceira): Promise<Record<string, any>> {
    throw new Error('ObjectToXsdMapperEfinanceiraAbertura.handle should be implemented')
  }
}