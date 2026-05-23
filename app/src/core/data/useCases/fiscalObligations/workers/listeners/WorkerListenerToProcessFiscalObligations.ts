
import { IWorkerListener, TWorkerListenerStructData } from "../../../../../../core/data/interfaces/application/workers/IWorkerListener.js"
import { RedisClient } from "../../../../../../core/infra/databases/connections/redis/RedisConnect.js"
import { EfinanceiraProcessPackageListener } from "../../../../../../modules/efinanceira/data/useCases/workers/EfinanceiraProcessPackageListener.js"
import { E_WORKER_PROCESS } from "../../../../../domain/fiscalObligations/names.js"
import { TFiscalObligationsEntryData } from "../../../../../domain/fiscalObligations/TFiscalObligationsEntryData.js"
import { ObjectToXsdMapperEfinanceiraAbertura } from "../../../../../../modules/efinanceira/data/useCases/objectToXsdMapper/ObjectToXsdMapperEfinanceiraAbertura.js"
import { ObjectToXsdMapperEfinanceiraMovFin } from "../../../../../../modules/efinanceira/data/useCases/objectToXsdMapper/ObjectToXsdMapperEfinanceiraMovFin.js"
import { LibxmljsEfinanceiraValidateXmlWithXsdAdapter } from "../../../../../../modules/efinanceira/infra/libs/libxmljs/LibxmljsEfinanceiraValidateXmlWithXsdAdapter.js"
import { Xmlbuilder2EfinanceiraObjectToXmlConverterAdapter } from "../../../../../../modules/efinanceira/infra/libs/xmlbuilder2/Xmlbuilder2EfinanceiraObjectToXmlConverterAdapter.js"
import { EfinanceiraXmlSigner } from "../../../../../../modules/efinanceira/data/useCases/xmlSigner/EfinanceiraXmlSigner.js"
import { EfinanceiraCreateBatchEvents } from "../../../../../../modules/efinanceira/data/useCases/createBatch/EfinanceiraCreateBatchEvents.js"
import { SQSClientAdapter } from "../../../../../infra/adapters/aws/sqs/SQSClientAdapter.js"
import { AWS_SQS } from "../../../../../../environment.js"


async function efinanceiraProcessPackageListenerFactory(): Promise<EfinanceiraProcessPackageListener> {
  const sqsObrigacaoEfinanceira = new SQSClientAdapter()
  sqsObrigacaoEfinanceira.setAWSSQSQueueUrl(AWS_SQS.EFINANCEIRA.INPUT.URL)
  sqsObrigacaoEfinanceira.setAWSClientSQS(AWS_SQS.EFINANCEIRA.INPUT.AWS_SQS_MAX_SOCKETS_REQUEST)

  return new EfinanceiraProcessPackageListener(
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

class WorkerListenerToProcessFiscalObligations {
  public async handle() {
    await this.databases()
    this.listen(await efinanceiraProcessPackageListenerFactory())
  }

  private listen(listener: IWorkerListener<Array<TFiscalObligationsEntryData>>): void {
    process.on('message', async (message: TWorkerListenerStructData<Array<TFiscalObligationsEntryData>>) => {
      process.send!(this.receivedMessage(message))
      await listener.handle(message)
    })
  }

  private receivedMessage(structData: TWorkerListenerStructData<Array<TFiscalObligationsEntryData>>): TWorkerListenerStructData<TFiscalObligationsEntryData> {
    return {
      identifier: E_WORKER_PROCESS.FISCAL_OBLIGATIONS_EVENTS_PACKAGE,
      message: "received",
      fiscalObligationsEventsPackage: structData.fiscalObligationsEventsPackage,
      worker: structData.worker
    } as TWorkerListenerStructData<TFiscalObligationsEntryData>
  }

  private async databases(): Promise<void> {
    const redis = new RedisClient()
    await redis.connect()
  }
}

new WorkerListenerToProcessFiscalObligations().handle()
