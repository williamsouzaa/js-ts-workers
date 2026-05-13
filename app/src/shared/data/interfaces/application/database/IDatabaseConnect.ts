export interface IDatabaseConnect {
  connect(): Promise<void | never>
}
