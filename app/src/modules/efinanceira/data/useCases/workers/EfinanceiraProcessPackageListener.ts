
import { IObjectToXmlConverter } from "../../../../../core/domain/fiscalObligations/IObjectToXmlConverter.js";
import { IObjectToXsdMapper } from "../../../../../core/domain/fiscalObligations/IObjectToXsdMapper.js";
import { IValidateXmlWithXsd } from "../../../../../core/domain/fiscalObligations/IValidateXmlWithXsd.js";
import { E_WORKER_PROCESS } from "../../../../../core/domain/fiscalObligations/names.js";
import { TEventEfinanceira, TFiscalObligationsEntryData } from "../../../../../core/domain/fiscalObligations/TFiscalObligationsEntryData.js";
import { IXmlSigner } from "../../../../../core/domain/fiscalObligations/IXmlSigner.js";
import { ICreateBatchEvents } from "../../../../../core/domain/fiscalObligations/ICreateBatchEvents.js";
import { IWorkerListener, TWorkerListenerStructData } from "../../../../../core/data/interfaces/application/workers/IWorkerListener.js";
import { IDeleteBatchMessagesInQueue } from "../../../../../core/data/interfaces/application/queue/IDeleteBatchMessagesInQueue.js";
import { TQueueMessage } from "../../../../../core/data/interfaces/application/queue/TQueueMessage.js";
import fs from 'fs'

type TProcessedEvent = {
  idGov: string
  xmlSigned: string
  sqs: { messageId: string; receiptId: string }
}

export class EfinanceiraProcessPackageListener implements IWorkerListener<Array<TFiscalObligationsEntryData>> {
  constructor(
    private objectToXsdMapper: Array<IObjectToXsdMapper<TEventEfinanceira>>,
    private objectToXmlConverter: IObjectToXmlConverter,
    private validateXmlWithXsd: IValidateXmlWithXsd<{layoutCode: string, xmlData: string}>,
    private xmlSigner: IXmlSigner<{xmlData: string, idGov: string}>,
    private createBatchXml: ICreateBatchEvents<Array<{idGov: string, xmlSigned: string}>>,
    private deleteBatchMessagesInQueue: IDeleteBatchMessagesInQueue,
  ) {}

  public async handle(structData: TWorkerListenerStructData<Array<TFiscalObligationsEntryData>>): Promise<void> {
    try {
      if (!this.isValidMessageToProcess(structData)) {
        console.log('[LOG][ERROR] - EfinanceiraProcessPackageListener - invalid message identifier')
        this.postMessageToMainThread(structData, [])
        return
      }
      await this.tryHandle(structData)
    } catch(error) {
      console.log('[LOG][ERROR] - EfinanceiraProcessPackageListener - fatal unhandled error:', error)
      this.postMessageToMainThread(structData, [])
    }
  }

  private async tryHandle(structData: TWorkerListenerStructData<Array<TFiscalObligationsEntryData>>): Promise<void> {
    const [, layoutCode] = structData.fiscalObligationsEventsPackage!.packageReference.keyGroup.split("#")
    const dataToProcess = this.handleToBuilDataToProcess(structData)


    const eventPromises: Array<Promise<TProcessedEvent | null>> = dataToProcess.entryData!.map(event => this.processEvent(layoutCode!, event))
    const processingResults = await Promise.all(eventPromises)

    const signedXmls: Array<{idGov: string, xmlSigned: string}> = []
    const redisEventsToDelete: Array<string> = []
    const queueMessagesToDelete: Array<Omit<TQueueMessage, 'body'>> = []

    for (const result of processingResults) {
      try {
        if (result === null) continue
        signedXmls.push({ idGov: result.idGov, xmlSigned: result.xmlSigned })
        redisEventsToDelete.push(result.idGov)
        queueMessagesToDelete.push(result.sqs)
      } catch(error) {
        console.log('[LOG][ERROR] - EfinanceiraProcessPackageListener - erro to sign event:', error)
      }
    }

    let batchXmlEvents: string
    try {
      batchXmlEvents = await this.createBatchXml.handle(signedXmls)
    } catch (batchError) {
      console.log('[LOG][ERROR] - EfinanceiraProcessPackageListener - batch generation failed, no events deleted from Redis or SQS:', batchError)
      this.postMessageToMainThread(structData, [])
      return
    }

    // await this.deleteBatchMessagesInQueue.deleteMessagesBatch(queueMessagesToDelete)

    fs.appendFileSync(`./output_${structData.worker?.id}.txt`, batchXmlEvents);
    for(const el of redisEventsToDelete) fs.appendFileSync(`./output_ids_${structData.worker?.id}.txt`, `${new Date()} - ${el}\n`);


    this.postMessageToMainThread(structData, redisEventsToDelete)
  }

  private async processEvent(layoutCode: string, event: TFiscalObligationsEntryData): Promise<TProcessedEvent | null> {
    try {
      const idGov = event.event.efinanceira!.idGov
      const sqs = event.from.sqs
      if (!sqs) {
        console.log('[LOG][ERROR] - EfinanceiraProcessPackageListener - processEvent - missing sqs reference for event:', idGov)
        return null
      }

      const objectInSchamaXsd = await this.handleObjectToXsdMapper(layoutCode, event)
      const xmlData = await this.objectToXmlConverter.handle(objectInSchamaXsd)
      const isValidXml = await this.validateXmlWithXsd.handle({ layoutCode, xmlData } as { layoutCode: string; xmlData: string })

      if (!isValidXml) {
        console.log('[LOG][WARN] - EfinanceiraProcessPackageListener - processEvent - XML validation failed for event:', idGov)
        return null
      }

      const xmlSigned = await this.xmlSigner.handle({ xmlData, idGov })
      return { idGov, xmlSigned, sqs }
    } catch (error) {
      console.log('[LOG][ERROR] - EfinanceiraProcessPackageListener - processEvent failed for event:', event.event.efinanceira?.idGov, error)
      return null
    }
  }

  private postMessageToMainThread(structData: TWorkerListenerStructData<Array<TFiscalObligationsEntryData>>, redisEventsToDelete: Array<string>): void {
    process.send!({
      identifier: E_WORKER_PROCESS.FISCAL_OBLIGATIONS_EVENTS_PACKAGE,
      message: 'processed',
      fiscalObligationsEventsPackage: structData.fiscalObligationsEventsPackage,
      worker: structData.worker,
      entryData: redisEventsToDelete
    } as TWorkerListenerStructData<Array<string>>)
  }

  private isValidMessageToProcess(structData: TWorkerListenerStructData<Array<TFiscalObligationsEntryData>>): boolean {
    return structData.identifier === E_WORKER_PROCESS.FISCAL_OBLIGATIONS_EVENTS_PACKAGE
  }

  private async handleObjectToXsdMapper(layoutCode: string, event: TFiscalObligationsEntryData): Promise<Record<string, any>> {
    for (const mapper of this.objectToXsdMapper) {
      if (mapper.layoutCode === layoutCode) return await mapper.handle(event.event.efinanceira as TEventEfinanceira)
    }
    throw new Error("EfinanceiraProcessPackageListener - no mapper found for layoutCode: " + layoutCode)
  }

  private handleToBuilDataToProcess(structData: TWorkerListenerStructData<Array<TFiscalObligationsEntryData>>): TWorkerListenerStructData<Array<TFiscalObligationsEntryData>> {
    const data: Array<TFiscalObligationsEntryData> = []
    for (const el of structData.binaryData as string[]) {
      const parsedData = JSON.parse(el)
      parsedData.event.efinanceira.evento = JSON.parse(parsedData.event.efinanceira.evento)
      data.push(parsedData)
    }
    structData['entryData'] = data
    delete structData.binaryData
    return structData
  }
}
