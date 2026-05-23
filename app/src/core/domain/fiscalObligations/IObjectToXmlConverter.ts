export interface IObjectToXmlConverter {
  handle(data: Record<string, any>): Promise<string>
}

