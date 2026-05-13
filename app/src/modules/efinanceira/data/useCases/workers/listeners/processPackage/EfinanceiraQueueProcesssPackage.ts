
import util from 'util'
import { IParentPortWorkerThread, TPostMessageStrucData } from '../../../../../../../shared/data/interfaces/application/workers/IParentPortWorkerThread.js';
import { E_WORKERS_PROCESS_QUEUE } from '../../../../../../../shared/domain/useCases/names/index.js';


export class EfinanceiraQueueProcesssPackage implements IParentPortWorkerThread {
  public async handle(structData: TPostMessageStrucData): Promise<void> {
    if (!this.isValidMessageToProcess(structData)) {
      throw new Error("ParentPortWorkerThreadQueueProcesssPackage - Invalid message to process")
    }

    const messageToProcess = this.handleToBuildMessageToProcess(structData)

    const logCompleto = util.inspect(messageToProcess, {
      showHidden: false,
      depth: null,
      colors: true
    });
    console.log(logCompleto);

    console.log("EfinanceiraQueueProcesssPackage - messageToProcess", logCompleto)

    // CONVERTER messageToProcess.data em um tipo layout correto se necessario - 1 primera serializacao
    // CONVERTER EM XML
    // VALIDAR ESTRUTURA XSD
    // ASSINAR CADA EVENTO
    // CRIAR LOTE
    // ENVIAR
  }

  private isValidMessageToProcess(structData: TPostMessageStrucData): boolean {
    return structData.identifier === "queue" && structData.queue?.identifier === E_WORKERS_PROCESS_QUEUE.PROCESS_PACKAGE
  }

  private handleToBuildMessageToProcess(structData: TPostMessageStrucData): TPostMessageStrucData {
    const data: any = []
    const decoder = new TextDecoder('utf-8');
    for(const el of structData.binaryData as Array<Uint8Array<ArrayBuffer>>) {
      const parsedData = JSON.parse(decoder.decode(el))
      parsedData.event.efinanceira.evento = JSON.parse(parsedData.event.efinanceira.evento)
      data.push(parsedData)
    }
    structData['entryData'] = data
    delete structData.binaryData
    return structData
  }
}