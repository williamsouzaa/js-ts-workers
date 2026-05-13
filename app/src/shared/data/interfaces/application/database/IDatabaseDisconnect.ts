export interface IDatabaseDisconnect {
  disconnect(): Promise<void | never>
}
