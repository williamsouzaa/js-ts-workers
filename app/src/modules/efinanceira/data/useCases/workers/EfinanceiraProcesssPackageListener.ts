
import { IObjectToXmlConverter } from "../../../../../shared/domain/fiscalObligations/IObjectToXmlConverter.js";
import { IObjectToXsdMapper } from "../../../../../shared/domain/fiscalObligations/IObjectToXsdMapper.js";
import { IValidateXmlWithXsd } from "../../../../../shared/domain/fiscalObligations/IValidateXmlWithXsd.js";
import { E_OBRIGACAO_CODIGO_LAYOUT, E_WORKER_PROCESS } from "../../../../../shared/domain/fiscalObligations/names.js";
import { TEventEfinanceira, TFiscalOBligationsEntryData } from "../../../../../shared/domain/fiscalObligations/TFiscalOBligartionsEntryData.js";
import { IXmlSigner } from "../../../../../shared/domain/fiscalObligations/IXmlSigner.js";
import { ICreateBatchEvents } from "../../../../../shared/domain/fiscalObligations/ICreateBatchEvents.js";
import fs from 'fs'
import { IWorkerListener, TWorkerListenerStructData } from "../../../../../shared/data/interfaces/application/workers/IWorkerListener.js";
import { IDeleteBatchMessagesInQueue } from "../../../../../shared/data/interfaces/application/queue/IDeleteBatchMessagesInQueue.js";
import { TQueueMessage } from "../../../../../shared/data/interfaces/application/queue/TQueueMessage.js";


export class EfinanceiraProcesssPackageListener implements IWorkerListener<Array<TFiscalOBligationsEntryData>> {
  constructor(
    private objectToXsdMapper: Array<IObjectToXsdMapper<TEventEfinanceira>>,
    private objectToXmlConverter: IObjectToXmlConverter,
    private validateXmlWithXsd: IValidateXmlWithXsd<{layoutCode: E_OBRIGACAO_CODIGO_LAYOUT, xmlData: string}>,
    private xmlSigner: IXmlSigner<{xmlData: string, idGov: string}>,
    private createBatchXml: ICreateBatchEvents<Array<{idGov: string, xmlSigned: string}>>,
    private deleteBatchMessagesInQueue: IDeleteBatchMessagesInQueue,
  ){}

  public async handle(structData: TWorkerListenerStructData<Array<TFiscalOBligationsEntryData>>): Promise<void> {
    try {
      if (!this.isValidMessageToProcess(structData)) throw new Error("ParentPortWorkerQueueProcesssPackage - Invalid message to process")
      await this.tryHandle(structData)
    } catch(error) {
      console.log('[LOG][ERROR] - EfinanceiraProcesssPackageListener - handle - structData.fiscalOBligationsEventsPackage: ', structData.fiscalOBligationsEventsPackage)
      console.log('[LOG][ERROR] - EfinanceiraProcesssPackageListener - handle - error: ', error)
    }
  }

  public async tryHandle(structData: TWorkerListenerStructData<Array<TFiscalOBligationsEntryData>>): Promise<void> {
      const [ _, layoutCode ] = structData.fiscalOBligationsEventsPackage!.packageReference.keyGroup.split("#")
      const dataToProcess = this.handleToBuilDataToProcess(structData)
      const errors: Array<string> = new Array()
      const signedXmls: Array<{idGov: string, xmlSigned: string}> = new Array()
      const queueMessagesToDelete: Array<Omit<TQueueMessage, 'body'>> = new Array()
      const redisEventsToDelete: Array<string> = new Array()

      for (const event of dataToProcess.entryData!) {
        try {
          const idGov = event.event.efinanceira!.idGov
          const objectInSchamaXsd = await this.handleObjectToXsdMapper(layoutCode as E_OBRIGACAO_CODIGO_LAYOUT, event)
          const xmlData = await this.objectToXmlConverter.handle(objectInSchamaXsd)
          const isValidXml = await this.validateXmlWithXsd.handle({layoutCode, xmlData} as { layoutCode: E_OBRIGACAO_CODIGO_LAYOUT; xmlData: string})
          if (!isValidXml) {
            errors.push(event.event.efinanceira!.idGov)
            continue
          }
          signedXmls.push({idGov, xmlSigned: await this.xmlSigner.handle({xmlData, idGov})})
          queueMessagesToDelete.push(event.from.sqs!)
          redisEventsToDelete.push(idGov)
        } catch(error) {
          errors.push(event.event.efinanceira!.idGov)
        }
      }

      const batchXmlEvents = await this.createBatchXml.handle(signedXmls)
      fs.appendFileSync(`./output_${structData.worker?.id}.txt`, batchXmlEvents);

      for(const el of redisEventsToDelete) {
        fs.appendFileSync(`./output_ids_${structData.worker?.id}.txt`, `${new Date()} - ${el}\n`);
      }

      await this.deleteBatchMessagesInQueue.deleteMessagesBatch(queueMessagesToDelete)
      this.postMessageToMainThread(structData, redisEventsToDelete)
  }

  private postMessageToMainThread(structData: TWorkerListenerStructData<Array<TFiscalOBligationsEntryData>>, redisEventsToDelete: Array<string>) {
    process.send!({
      identifier: E_WORKER_PROCESS.FISCAL_OBLIGARTIONS_EVENTS_PACKAGE,
      message: 'processed',
      fiscalOBligationsEventsPackage: structData.fiscalOBligationsEventsPackage,
      worker: structData.worker,
      entryData: redisEventsToDelete
    } as TWorkerListenerStructData<Array<string>>)
  }

  private isValidMessageToProcess(structData: TWorkerListenerStructData<Array<TFiscalOBligationsEntryData>>): boolean {
    return structData.identifier === E_WORKER_PROCESS.FISCAL_OBLIGARTIONS_EVENTS_PACKAGE
  }

  private async handleObjectToXsdMapper(layoutCode: E_OBRIGACAO_CODIGO_LAYOUT, event: TFiscalOBligationsEntryData): Promise<Record<string, any>> {
    for(const mapper of this.objectToXsdMapper) {
      if(mapper.layoutCode === layoutCode) return await mapper.handle(event.event.efinanceira as TEventEfinanceira)
    }
    throw new Error("Error - EfinanceiraProcesssPackageListener - handleToFixJsonToSchemaXSD")
  }

  private handleToBuilDataToProcess(structData: TWorkerListenerStructData<Array<TFiscalOBligationsEntryData>>): TWorkerListenerStructData<Array<TFiscalOBligationsEntryData>> {
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