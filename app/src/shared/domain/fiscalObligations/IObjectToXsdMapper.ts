import { E_OBRIGACAO_CODIGO_LAYOUT } from "./names.js"

export interface IObjectToXsdMapper<T> {
  layoutCode: E_OBRIGACAO_CODIGO_LAYOUT
  handle(data: T): Promise<Record<string, any> | Error>
}






