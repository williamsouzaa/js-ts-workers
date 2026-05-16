export interface IXmlEnvelopeGenerator {
  handle(data: Array<string>): Promise<string>
}
