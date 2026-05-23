export interface IValidateXmlWithXsd<T> {
  handle(data: T): Promise<boolean>
}
