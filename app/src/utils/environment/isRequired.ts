export function isRequired(variable: string): never {
  throw new Error(`${variable} not found in .env file`)
}
