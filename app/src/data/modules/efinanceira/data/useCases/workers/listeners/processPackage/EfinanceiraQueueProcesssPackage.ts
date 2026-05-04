import { IParentPortWorkerThread } from "../../../../../../../interfaces/application/workers/IParentPortWorkerThread.js";
import { TPostMessageStrucData } from "../../../../../../../interfaces/application/workers/TPostMessageStrucData.js";

export class EfinanceiraQueueProcesssPackage implements IParentPortWorkerThread {
  public async handle(structData: TPostMessageStrucData): Promise<void> {
    if (!this.isValidMessageToProcess(structData)) {
      throw new Error("ParentPortWorkerThreadQueueProcesssPackage - Invalid message to process")
    }
    const messageToProcess = this.handleToBuildMessageToProcess(structData)

    // CONVERTER messageToProcess.data em um tipo layout correto se necessario - 1 primera serializacao
    // CONVERTER EM XML
    // VALIDAR ESTRUTURA XSD
    // ASSINAR CADA EVENTO
    // CRIAR LOTE
    // ENVIAR
  }

  private isValidMessageToProcess(structData: TPostMessageStrucData): boolean {
    return structData.identifier === "queue" && structData.queue?.identifier === "processPakage"
  }

  private handleToBuildMessageToProcess(structData: TPostMessageStrucData): TPostMessageStrucData {
    const decoder = new TextDecoder('utf-8');
    const parsedData = decoder.decode(structData.binaryData);
    const data = JSON.parse(parsedData)

    structData['data'] = data
    return structData
  }
}