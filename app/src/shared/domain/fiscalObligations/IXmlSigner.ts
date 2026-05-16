export interface IXmlSigner {
  handle(data: string): Promise<string>
}