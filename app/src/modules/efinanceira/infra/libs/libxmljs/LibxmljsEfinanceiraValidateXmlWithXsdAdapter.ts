import fs from 'fs'
import path from 'path'
import libxmljs, {Document} from 'libxmljs2'
import { IValidateXmlWithXsd } from '../../../../../shared/domain/fiscalObligations/IValidateXmlWithXsd.js'
import { E_OBRIGACAO_CODIGO_LAYOUT } from '../../../../../shared/domain/fiscalObligations/names.js'


export class LibxmljsEfinanceiraValidateXmlWithXsdAdapter implements IValidateXmlWithXsd<{layoutCode: E_OBRIGACAO_CODIGO_LAYOUT, xmlData: string}> {
  private evtMovOpFinXsd!: Document
  private evtAberturaeFinanceiraXsd!: Document

  constructor() {
    this.setAllLayoutsXSD()
  }

  public setAllLayoutsXSD(): void {
    const projectRoot = process.cwd();
    const xsdsBasePath = path.resolve(projectRoot, 'app/src/modules/efinanceira/infra/storage/XSDs/layouts')

    this.evtMovOpFinXsd = libxmljs.parseXml(fs.readFileSync(path.join(xsdsBasePath, 'evtMovOpFin.xsd'), 'utf8'))
    this.evtAberturaeFinanceiraXsd = libxmljs.parseXml(fs.readFileSync(path.join(xsdsBasePath, 'evtAberturaeFinanceira.xsd'), 'utf8'))
  }

  public async handle(data: { layoutCode: E_OBRIGACAO_CODIGO_LAYOUT; xmlData: string; }): Promise<boolean> {
    const xmlDoc = libxmljs.parseXml(data.xmlData)

    let isValid
    switch (data.layoutCode) {
      case E_OBRIGACAO_CODIGO_LAYOUT.EFINANCEIRA_ABERTURA:
        isValid = xmlDoc.validate(this.evtAberturaeFinanceiraXsd)
        break
      case E_OBRIGACAO_CODIGO_LAYOUT.EFINANCEIRA_MOVIMENTACAO_FINACEIRA:
        isValid = xmlDoc.validate(this.evtMovOpFinXsd)
        break
      default:
        throw new Error('Layout novo não mapeado')
    }

    if (!isValid) xmlDoc.validationErrors.forEach((error) => console.log(` - Linha ${error.line}: ${error.message.trim()}`))
    return isValid
  }
}