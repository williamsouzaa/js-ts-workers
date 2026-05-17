import { E_OBRIGACAO_CODIGO_LAYOUT } from "./names.js";

export interface IValidateXmlWithXsd<T> {
  handle(data: T): Promise<boolean>
}
