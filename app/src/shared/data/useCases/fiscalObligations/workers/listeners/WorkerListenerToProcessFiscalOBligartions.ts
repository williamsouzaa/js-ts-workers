
import { IWorkerListener, TWorkerListenerStructData } from "../../../../../../shared/data/interfaces/application/workers/IWorkerListener.js"
import { RedisClient } from "../../../../../../shared/infra/databases/connections/redis/RedisConnect.js"
import { EfinanceiraProcesssPackageListener } from "../../../../../../modules/efinanceira/data/useCases/workers/EfinanceiraProcesssPackageListener.js"
import { E_WORKER_PROCESS } from "../../../../../domain/fiscalObligations/names.js"
import { TFiscalOBligationsEntryData } from "../../../../../domain/fiscalObligations/TFiscalOBligartionsEntryData.js"
import { ObjectToXsdMapperEfinanceiraAbertura } from "../../../../../../modules/efinanceira/data/useCases/objectToXsdMapper/ObjectToXsdMapperEfinanceiraAbertura.js"
import { ObjectToXsdMapperEfinanceiraMovFin } from "../../../../../../modules/efinanceira/data/useCases/objectToXsdMapper/ObjectToXsdMapperEfinanceiraMovFin.js"
import { LibxmljsEfinanceiraValidateXmlWithXsdAdapter } from "../../../../../../modules/efinanceira/infra/libs/libxmljs/LibxmljsEfinanceiraValidateXmlWithXsdAdapter.js"
import { Xmlbuilder2EfinanceiraObjectToXmlConverterAdapter } from "../../../../../../modules/efinanceira/infra/libs/xmlbuilder2/Xmlbuilder2EfinanceiraObjectToXmlConverterAdapter.js"
import { IWorkerListenerFactory } from "../../../../interfaces/application/workers/IWorkerListenerFactory.js"
import { EfinanceiraXmlSigner } from "../../../../../../modules/efinanceira/data/useCases/xmlSigner/EfinanceiraXmlSigner.js"
import { EfinanceiraCreateBatchEvents } from "../../../../../../modules/efinanceira/data/useCases/craeteBatch/EfinanceiraCreateBatchEvents.js"
import { SQSClientAdapter } from "../../../../../infra/adapters/aws/sqs/SQSClientAdapter.js"
import { SQSClient } from "@aws-sdk/client-sqs"


function getInstanceAwsSkdSqsClient(): SQSClient {
  return new SQSClient({
    region: "us-east-1",
    endpoint: process.env.AWS_SQS_QUEUE_ENDPOINT_EFINANCEIRA as string,
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test"
    }
  })
}

async function efinanceiraProcesssPackageListenerFactory(): Promise<EfinanceiraProcesssPackageListener> {
  const sqsObrigacaoEfinanceira = new SQSClientAdapter()
  sqsObrigacaoEfinanceira.setAWSSQSQueueUrl(process.env.AWS_SQS_QUEUE_URL_EFINANCEIRA as string)
  sqsObrigacaoEfinanceira.setAWSClientSQS(getInstanceAwsSkdSqsClient())

  return new EfinanceiraProcesssPackageListener(
      [
        new ObjectToXsdMapperEfinanceiraAbertura(),
        new ObjectToXsdMapperEfinanceiraMovFin(),
      ],
      new Xmlbuilder2EfinanceiraObjectToXmlConverterAdapter(),
      new LibxmljsEfinanceiraValidateXmlWithXsdAdapter(),
      new EfinanceiraXmlSigner(),
      new EfinanceiraCreateBatchEvents(),

      sqsObrigacaoEfinanceira
    )
}


class WorkerListenerToProcessFiscalOBligartions implements IWorkerListenerFactory {
  public async handle() {
    await this.databases()
    this.listen(await efinanceiraProcesssPackageListenerFactory())
  }

  private listen(listener: IWorkerListener<Array<TFiscalOBligationsEntryData>>): void {
    process.on('message', async (message: TWorkerListenerStructData<Array<TFiscalOBligationsEntryData>>) => {
      const decodedMessage = this.decodeBinaryData(message)
      process.send!(this.receivedMessage(decodedMessage))
      await listener.handle(decodedMessage)
    })
  }

  private decodeBinaryData(message: TWorkerListenerStructData<Array<TFiscalOBligationsEntryData>>): TWorkerListenerStructData<Array<TFiscalOBligationsEntryData>> {
    const encoding = (message as any)._encoding as string | undefined
    if (!encoding) return message

    if (encoding === 'base64list' && Array.isArray(message.binaryData)) {
      const decoded = (message.binaryData as unknown as string[]).map(
        (b64) => new Uint8Array(Buffer.from(b64, 'base64'))
      )
      return { ...message, binaryData: decoded as any }
    }

    if (encoding === 'base64' && typeof message.binaryData === 'string') {
      const decoded = new Uint8Array(Buffer.from(message.binaryData as unknown as string, 'base64'))
      return { ...message, binaryData: decoded as any }
    }

    return message
  }

  private receivedMessage(structData: TWorkerListenerStructData<Array<TFiscalOBligationsEntryData>>): TWorkerListenerStructData<TFiscalOBligationsEntryData> {
    return {
      identifier: E_WORKER_PROCESS.FISCAL_OBLIGARTIONS_EVENTS_PACKAGE,
      message: "received",
      fiscalOBligationsEventsPackage: structData.fiscalOBligationsEventsPackage,
      worker: structData.worker
    } as TWorkerListenerStructData<TFiscalOBligationsEntryData>
  }

  private async databases(): Promise<void> {
    const redis = new RedisClient()
    await redis.connect()
  }
}

new WorkerListenerToProcessFiscalOBligartions().handle()
