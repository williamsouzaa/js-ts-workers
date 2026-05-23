import libxmljs, {Document} from 'libxmljs2'
import { IValidateXmlWithXsd } from '../../../../../core/domain/fiscalObligations/IValidateXmlWithXsd.js'
import { handleReadFileSync } from '../../../../../utils/handleReadFileSync.js'
import { EFINANCEIRA, LAYOUTS_XSD } from '../../../../../environment.js'
import { E_OBRIGACOES_CODIGO_LAYOUT } from '../../../../../core/domain/fiscalObligations/names.js'


export class LibxmljsEfinanceiraValidateXmlWithXsdAdapter implements IValidateXmlWithXsd<{layoutCode: string, xmlData: string}> {
  private evtMovOpFinXsd!: Document
  private evtAberturaeFinanceiraXsd!: Document

  constructor() {
    this.evtMovOpFinXsd = libxmljs.parseXml(handleReadFileSync(LAYOUTS_XSD.EFINANCEIRA.BASE_PATH, 'evtMovOpFin.xsd') as string)
    this.evtAberturaeFinanceiraXsd = libxmljs.parseXml(handleReadFileSync(LAYOUTS_XSD.EFINANCEIRA.BASE_PATH, 'evtAberturaeFinanceira.xsd') as string)
  }

  public async handle(data: { layoutCode: string; xmlData: string; }): Promise<boolean> {
    const xmlDoc = libxmljs.parseXml(data.xmlData)

    let isValid
    switch (data.layoutCode) {
      case E_OBRIGACOES_CODIGO_LAYOUT.EFINANCEIRA_ABERTURA:
        isValid = xmlDoc.validate(this.evtAberturaeFinanceiraXsd)
        break
      case E_OBRIGACOES_CODIGO_LAYOUT.EFINANCEIRA_MOVIMENTACAO_FINANCEIRA:
        isValid = xmlDoc.validate(this.evtMovOpFinXsd)
        break
      default:
        throw new Error('Layout novo não mapeado')
    }

    if (!isValid) xmlDoc.validationErrors.forEach((error) => console.log(` - Linha ${error.line}: ${error.message.trim()}`))
    return isValid
  }
}