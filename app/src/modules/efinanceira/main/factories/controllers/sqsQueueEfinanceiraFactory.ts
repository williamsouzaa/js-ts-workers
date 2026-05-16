import { SQSClient } from "@aws-sdk/client-sqs"
import { WorkerThreadErrorEventHandler } from "../../../../../shared/data/useCases/application/workersThreads/listeners/events/WorkerThreadErrorEventHandler.js"
import { WorkerThreadExitEventHandler } from "../../../../../shared/data/useCases/application/workersThreads/listeners/events/WorkerThreadExitEventHandler.js"
import { SQSClientAdapter } from "../../../../../shared/infra/adapters/aws/sqs/SQSClientAdapter.js"
import { SQSController } from "../../../../../shared/presentation/controllers/aws/sqs/SQSController.js"
import { IQueueController } from "../../../../../shared/presentation/interfaces/queue/IQueueController.js"
import { sleep } from "../../../../../utils/sleep.js"
import { BuildEntryDataFromSQSMessage } from "../../../../fiscalOBligations/data/useCases/entryData/BuildEntryDataFromSQSMessage.js"
import { FiscalOBligationsOrchestrator } from "../../../../fiscalOBligations/data/useCases/FiscalObligartionsOrchestrator.js"
import { WorkerThreadSucessEventHandlerfiscalOBligations } from "../../../../fiscalOBligations/data/useCases/workers/listeners/WorkerThreadSucessEventHandlerFiscalOBligartions.js"
import { WorkerThreadFiscalOBligations } from "../../../../fiscalOBligations/data/useCases/workers/WorkerThreadFiscalOBligartions.js"
import { WorkerThreadPoolFiscalOBligations } from "../../../../fiscalOBligations/data/useCases/workers/WorkerThreadPoolFiscalOBligartions.js"
import { RedisfiscalOBligationsPackageRepositoryAdapter } from "../../../../fiscalOBligations/infra/databases/repositories/redis/RedisFiscalOBligartionsPackageRepositoryAdapter.js"
import { IFiscalObligationsEventsPackage } from "../../../../fiscalOBligations/domain/contracts/IFiscalObligationsEventsPackage.js"
import { FiscalOBligationsEventsPackage } from "../../../../fiscalOBligations/data/useCases/eventsPackages/FiscalOBligartionsEventsPackage.js"

function getfiscalOBligationsEventsPackageFactory(): IFiscalObligationsEventsPackage {
  const fiscalOBligationsEventsPackage = new FiscalOBligationsEventsPackage()
  fiscalOBligationsEventsPackage.setLimitPerPackage(2)
  fiscalOBligationsEventsPackage.setTimeLimitToHoldingPackageInSecods(5)
  return fiscalOBligationsEventsPackage
}

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

export async function sqsQueueEfinanceiraFactory(): Promise<IQueueController> {
  const sqsObrigacaoEfinanceira = new SQSClientAdapter()
  sqsObrigacaoEfinanceira.setAWSSQSQueueUrl(process.env.AWS_SQS_QUEUE_URL_EFINANCEIRA as string)
  sqsObrigacaoEfinanceira.setAWSClientSQS(getInstanceAwsSkdSqsClient())

  const fiscalOBligationsEventsPackage = getfiscalOBligationsEventsPackageFactory()

  const workerThreadManager = new WorkerThreadPoolFiscalOBligations(() => new WorkerThreadFiscalOBligations(
      new WorkerThreadSucessEventHandlerfiscalOBligations(fiscalOBligationsEventsPackage),
      new WorkerThreadErrorEventHandler(),
      new WorkerThreadExitEventHandler(),
  ))

  await workerThreadManager.init("./dist/src/modules/fiscalOBligations/data/useCases/workers/listeners/WorkerListenerToProcessFiscalOBligartions.js", 4)
  await sleep(5000)
  console.log('[LOG][INFO] - sqsQueueEfinanceiraFactory - workerThreadManager:', workerThreadManager)

  return new SQSController(
    sqsObrigacaoEfinanceira,
    new BuildEntryDataFromSQSMessage(),
    new FiscalOBligationsOrchestrator(
      fiscalOBligationsEventsPackage,
      workerThreadManager,
      new RedisfiscalOBligationsPackageRepositoryAdapter()
    )
  )

}