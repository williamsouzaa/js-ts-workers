import { create } from 'xmlbuilder2'
import { IObjectToXmlConverter } from '../../../../../shared/domain/fiscalObligations/IObjectToXmlConverter.js'

export class Xmlbuilder2EfinanceiraObjectToXmlConverterAdapter implements IObjectToXmlConverter {
  public async handle(data: Record<string, any>): Promise<string> {
    const xmlString = create(data).end({ prettyPrint: false })
    return xmlString
  }
}