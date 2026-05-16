import { IParentPortWorkerThread, TPostMessageStrucData } from "../../../../../shared/data/interfaces/application/workers/IParentPortWorkerThread.js";
// child_process: no parentPort import needed — use process.send() directly
import { IObjectToXmlConverter } from "../../../../../shared/domain/fiscalObligations/IObjectToXmlConverter.js";
import { IObjectToXsdMapper } from "../../../../../shared/domain/fiscalObligations/IObjectToXsdMapper.js";
import { IValidateXmlWithXsd } from "../../../../../shared/domain/fiscalObligations/IValidateXmlWithXsd.js";
import { E_OBRIGACAO_CODIGO_LAYOUT, E_WORKER_PROCESS } from "../../../../../shared/domain/fiscalObligations/names.js";
import { TPackageReference } from "../../../../../shared/domain/fiscalObligations/IFiscalObligationsEventsPackage.js";
import { TFiscalOBligationsEntryData } from "../../../../../shared/domain/fiscalObligations/TFiscalOBligartionsEntryData.js";


export type TPackageProcessResponse = {
  identifier: 'success' | 'error' | 'erroPartial'
  success?: TPackageReference
  error?:  TPackageReference
  erroPartial?: {
    packageReference: TPackageReference,
    eventId: string
  }
}

export class EfinanceiraProcesssPackageListener implements IParentPortWorkerThread<Array<TFiscalOBligationsEntryData>> {
  constructor(
    private objectToXsdMapper: Array<IObjectToXsdMapper<TFiscalOBligationsEntryData>>,
    private objectToXmlConverter: IObjectToXmlConverter,
    private validateXmlWithXsd: IValidateXmlWithXsd<{layoutCode: E_OBRIGACAO_CODIGO_LAYOUT, xmlData: string}>
  ){}

  public async handle(structData: TPostMessageStrucData<Array<TFiscalOBligationsEntryData>>): Promise<void> {

    console.log('########################################################################################')
    console.log('########################################################################################')
    console.log('########################################################################################')
    console.log('########################################################################################')

    console.log("objectToXsdMapper", this.objectToXsdMapper)
    console.log("objectToXmlConverter", this.objectToXmlConverter)
    console.log("validateXmlWithXsd", this.validateXmlWithXsd)
    console.log("structData", structData)

    console.log('########################################################################################')
    console.log('########################################################################################')
    console.log('########################################################################################')
    console.log('########################################################################################')




    // try {
    //   const packageReference = structData.fiscalOBligationsEventsPackage!.packageReference
    //   const [ _, layoutCode ] = packageReference.keyGroup.split("#")

    //   if (!this.isValidMessageToProcess(structData)) {
    //     throw new Error("ParentPortWorkerThreadQueueProcesssPackage - Invalid message to process")
    //   }

    //   const messageToProcess = this.handleToBuildMessageToProcess(structData)
    //   const totalEvents = messageToProcess.entryData!.length
    //   const errors: Array<string> = new Array()
    //   const xmls: Array<string> = new Array()




    //   for (const event of messageToProcess.entryData!) {
    //     const objectInSchamaXsd = await this.handleObjectToXsdMapper(layoutCode as E_OBRIGACAO_CODIGO_LAYOUT, event)
    //     if (Error.isError(objectInSchamaXsd)) {
    //       errors.push(event.event.efinanceira!.idGov)
    //       continue
    //     }

    //     // const xmlData = await this.objectToXmlConverter.handle(objectInSchamaXsd)
    //     // if (Error.isError(xmlData)) {
    //     //   errors.push(event.event.efinanceira!.idGov)
    //     //   continue
    //     // }

    //     // const validateXmlWithXsdParams = {layoutCode, xmlData} as { layoutCode: E_OBRIGACAO_CODIGO_LAYOUT; xmlData: string}
    //     // const isValidXml = await this.validateXmlWithXsd.handle(validateXmlWithXsdParams)
    //     // if (!isValidXml) {
    //     //   errors.push(event.event.efinanceira!.idGov)
    //     //   continue
    //     // }

    //     // console.log("EfinanceiraProcesssPackageListener - handle - xmlData >>", xmlData)
    //   }

    //   process.send!({ identifier: 'success', success: packageReference })
    // } catch(error) {
    //   process.send!({
    //     identifier: 'error',
    //     error: structData.fiscalOBligationsEventsPackage!.packageReference
    //   })
    //   console.log('[LOG][ERROR] - EfinanceiraProcesssPackageListener - handle - error: ', error)
    // }
  }

  private isValidMessageToProcess(structData: TPostMessageStrucData<Array<TFiscalOBligationsEntryData>>): boolean {
    return structData.identifier === E_WORKER_PROCESS.FISCAL_OBLIGARTIONS_EVENTS_PACKAGE
  }

  private async handleObjectToXsdMapper(layoutCode: E_OBRIGACAO_CODIGO_LAYOUT, event: TFiscalOBligationsEntryData): Promise<Record<string, any> | Error> {

    console.log("=================================================================")
    console.log("=================================================================")
    console.log("=================================================================")

    console.log("this.objectToXsdMapper: ", this.objectToXsdMapper)
    console.log("layoutCode: ", layoutCode)
    console.log("event: ", event)

    console.log("=================================================================")
    console.log("=================================================================")
    console.log("=================================================================")

    return {}
    // for(const mapper of this.objectToXsdMapper) {
    //   if(mapper.layoutCode === layoutCode) return await mapper.handle(event)
    // }
    // throw new Error("Error - EfinanceiraProcesssPackageListener - handleToFixJsonToSchemaXSD")
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