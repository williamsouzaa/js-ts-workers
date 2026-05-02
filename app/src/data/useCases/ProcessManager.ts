import { TBusinessRule, TBusinessRuleEvent } from "../../domain/useCases/names/dataInput/TBusinessRule.js";

export class ProcessManager {

  public async handle(businessRule: TBusinessRule): Promise<void> {
    const eventId = businessRule.event.id
    const keyGroup = this.buildKeyGroup(businessRule.event)

    console.log("eventId", eventId)
    console.log("keyGroup", keyGroup)
  }

  private buildKeyGroup(event: TBusinessRuleEvent): string {
    const keyParts = [
      event.obrigacao,
      event.cnpjEmpresa,
      event.codigoLayout,
      event.anoObrigacao,
      event.mesObrigacao,
      event.diaObrigacao
    ];

    console.log("keyParts >>", keyParts)
    return keyParts.filter(part => part !== undefined && part !== null).join('#');
  }
}
