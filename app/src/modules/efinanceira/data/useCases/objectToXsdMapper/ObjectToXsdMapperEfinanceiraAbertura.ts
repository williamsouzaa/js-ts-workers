import { IObjectToXsdMapper } from "../../../../../shared/domain/fiscalObligations/IObjectToXsdMapper.js"
import { E_OBRIGACAO_CODIGO_LAYOUT } from "../../../../../shared/domain/fiscalObligations/names.js"
import { TFiscalOBligationsEntryData } from "../../../../../shared/domain/fiscalObligations/TFiscalOBligartionsEntryData.js"

export class ObjectToXsdMapperEfinanceiraAbertura implements IObjectToXsdMapper<TFiscalOBligationsEntryData> {
  layoutCode = E_OBRIGACAO_CODIGO_LAYOUT.EFINANCEIRA_ABERTURA

  public async handle(data: TFiscalOBligationsEntryData): Promise<Record<string, any> | Error> {
    try {
      return {}
    } catch(error) {
      console.log('[LOG][ERROR] - ObjectToXsdMapperEfinanceiraAbertura - error: ', error)
      return new Error("Error to ObjectToXsdMapperEfinanceiraAbertura")
    }
  }
}