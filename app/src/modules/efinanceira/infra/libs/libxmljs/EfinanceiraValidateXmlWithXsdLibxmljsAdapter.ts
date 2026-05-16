import fs from 'fs'
import path from 'path'
import libxmljs, {Document} from 'libxmljs2'
import { IValidateXmlWithXsd } from '../../../../../shared/domain/fiscalObligations/IValidateXmlWithXsd.js'
import { E_OBRIGACAO_CODIGO_LAYOUT } from '../../../../../shared/domain/fiscalObligations/names.js'

export class EfinanceiraValidateXmlWithXsdLibxmljsAdapter implements IValidateXmlWithXsd<{layoutCode: E_OBRIGACAO_CODIGO_LAYOUT, xmlData: string}> {
  // private evtMovOpFinXsd!: Document
  // private evtAberturaeFinanceiraXsd!: Document

  public setAllLayoutsXSD(): void {



    // const projectRoot = process.cwd();
    // const xsdsBasePath = path.resolve(projectRoot, 'dist/src/modules/efinanceira/infra/storage/XSDs/layouts');

    // console.log("xsdsBasePath >> ", xsdsBasePath)
    // console.log("path.join(xsdsBasePath, 'evtMovOpFin.xsd') >> ", path.join(xsdsBasePath, 'evtMovOpFin.xsd'))

    // this.evtMovOpFinXsd = libxmljs.parseXml(fs.readFileSync(path.join(xsdsBasePath, 'evtMovOpFin.xsd'), 'utf8'))
    // this.evtAberturaeFinanceiraXsd = libxmljs.parseXml(fs.readFileSync(path.join(xsdsBasePath, 'evtAberturaeFinanceira.xsd'), 'utf8'))
  }

  public async handle(data: { layoutCode: E_OBRIGACAO_CODIGO_LAYOUT; xmlData: string; }): Promise<boolean | Error> {
    const xmlDoc = libxmljs.parseXmlString(`<root><element>Data</element></root>`);

    console.log("AQUI >>> ", xmlDoc.root()!.name())

    return true

  //   try {
  //     const xmlDoc = libxml.parseXml(data.xmlData)

  //     switch (data.layoutCode) {
  //       case E_OBRIGACAO_CODIGO_LAYOUT.EFINANCEIRA_ABERTURA:
  //         return xmlDoc.validate(this.evtAberturaeFinanceiraXsd)
  //       case E_OBRIGACAO_CODIGO_LAYOUT.EFINANCEIRA_MOVIMENTACAO_FINACEIRA:
  //         return xmlDoc.validate(this.evtMovOpFinXsd)
  //       default:
  //         throw new Error('Layout novo não mapeado')
  //     }
  //   } catch (error) {
  //     console.log('[LOG][ERROR] - EfinanceiraValidateXmlWithXsdAdapter - error: ', error)
  //     return new Error('Error EfinanceiraValidateXmlWithXsdAdapter')
  //   }
  }
}