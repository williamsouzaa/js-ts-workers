import { IObjectToXsdMapper } from "../../../../../shared/domain/fiscalObligations/IObjectToXsdMapper.js"
import { E_OBRIGACAO_CODIGO_LAYOUT } from "../../../../../shared/domain/fiscalObligations/names.js"
import { TFiscalOBligationsEntryData } from "../../../../../shared/domain/fiscalObligations/TFiscalOBligartionsEntryData.js"

export class ObjectToXsdMapperEfinanceiraMovFin implements IObjectToXsdMapper<TFiscalOBligationsEntryData> {
  layoutCode = E_OBRIGACAO_CODIGO_LAYOUT.EFINANCEIRA_MOVIMENTACAO_FINACEIRA

  public async handle(data: TFiscalOBligationsEntryData): Promise<Record<string, any> | Error> {
    try {
      console.log('ObjectToXsdMapperEfinanceiraMovFin - handle - data: ', data)

      return {}
    } catch(error) {
      console.log('[LOG][ERROR] - ObjectToXsdMapperEfinanceiraMovFin - error: ', error)
      return new Error("Error to ObjectToXsdMapperEfinanceiraMovFin")
    }
  }
}