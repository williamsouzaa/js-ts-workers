import { error } from "console";
import { IParentPortWorkerThread, TPostMessageStrucData } from "../../../../../shared/data/interfaces/application/workers/IParentPortWorkerThread.js";
import { logDepth } from "../../../../../utils/logDepth.js";
import { TPackageReference } from "../../../../fiscalOBligations/domain/contracts/IFiscalObligationsEventsPackage.js";
import { TFiscalOBligationsEntryData } from "../../../../fiscalOBligations/domain/contracts/TFiscalOBligartionsEntryData.js";
import { E_WORKER_PROCESS } from "../../../../fiscalOBligations/domain/names.js";
import { parentPort, workerData } from "worker_threads"


export type TPackageProcessResponse = {
  identifier: 'success' | 'error' | 'erroPartial'
  success?: TPackageReference
  error?:  TPackageReference
  erroPartial?: {
    packageReference: TPackageReference,
    eventId: string
  }
}

export interface IFixJsonToSchemaXSD {
  codLayout: string
  handle(data: Record<string, any>): Promise<Record<string, any> | Error>
}

export interface IConvertObjectToXML {
  handle(data: Record<string, any>): Promise<string | Error>
}

export interface IValidLayoutXSD {
  handle(xmlString: string): Promise<boolean | Error>
}

export interface ISignXmlEvent {
  handle(data: string): Promise<string>
}

export interface ICreateXMLPackage {
  handle(data: Array<string>): Promise<string>
}


export class EfinanceiraProcesssPackageListener implements IParentPortWorkerThread<Array<TFiscalOBligationsEntryData>> {

  constructor(
    private fixJsonToSchemaXSD: Array<IFixJsonToSchemaXSD>,
    private convertObjectToXML: IConvertObjectToXML,
    private validLayoutXSD: IValidLayoutXSD,
    private signXmlEvent: ISignXmlEvent,
    private createXMLPackage: ICreateXMLPackage,
  ){}

  public async handle(structData: TPostMessageStrucData<Array<TFiscalOBligationsEntryData>>): Promise<void> {
    try {
      const packageReference = structData.fiscalOBligationsEventsPackage!.packageReference

      if (!this.isValidMessageToProcess(structData)) {
        throw new Error("ParentPortWorkerThreadQueueProcesssPackage - Invalid message to process")
      }

      const messageToProcess = this.handleToBuildMessageToProcess(structData)
      const totalEvents = messageToProcess.entryData!.length
      const errors: Array<string> = new Array()
      const xmls: Array<string> = new Array()

      const

      for (const event of messageToProcess.entryData!) {
        event.event.efinanceira!
        event.event.efinanceira?.idGov
        event.event.efinanceira?.evento

        const objectAlreadyToConvert = this.handleToFixJsonToSchemaXSD(event)
        if (Error.isError(objectAlreadyToConvert)) {
          errors.push(event.event.efinanceira!.idGov)
          continue
        }

        const xmlData = this.convertObjectToXML(objectAlreadyToConvert)
        if (Error.isError(xmlData)) {
          errors.push(event.event.efinanceira!.idGov)
          continue
        }

        const isValidXml = this.handleToValidLayoutXSD(objectAlreadyToConvert)
        if (!isValidXml) {
          errors.push(event.event.efinanceira!.idGov)
          continue
        }

        delete event.event.efinanceira?.evento
        xmlData

      }

      parentPort!.postMessage({ identifier: 'success', success: packageReference })
    } catch(error) {
      parentPort!.postMessage({
        identifier: 'error',
        error: structData.fiscalOBligationsEventsPackage!.packageReference
      })
      console.log('[LOG][ERROR] - EfinanceiraProcesssPackageListener - handle - error: ', error)
    }
  }

  private isValidMessageToProcess(structData: TPostMessageStrucData<Array<TFiscalOBligationsEntryData>>): boolean {
    return structData.identifier === E_WORKER_PROCESS.FISCAL_OBLIGARTIONS_EVENTS_PACKAGE
  }

  private handleToBuildMessageToProcess(structData: TPostMessageStrucData<Array<TFiscalOBligationsEntryData>>): TPostMessageStrucData<Array<TFiscalOBligationsEntryData>> {
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