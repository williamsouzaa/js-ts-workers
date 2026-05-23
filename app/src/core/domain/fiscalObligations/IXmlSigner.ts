export interface IXmlSigner<T> {
  handle(data: T): Promise<string>
}