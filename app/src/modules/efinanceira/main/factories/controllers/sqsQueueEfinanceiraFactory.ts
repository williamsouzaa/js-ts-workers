import { SQSClient } from "@aws-sdk/client-sqs"
import { WorkerThreadErrorEventHandler } from "../../../../../shared/data/useCases/application/workersThreads/listeners/events/WorkerThreadErrorEventHandler.js"
import { WorkerThreadExitEventHandler } from "../../../../../shared/data/useCases/application/workersThreads/listeners/events/WorkerThreadExitEventHandler.js"
import { SQSClientAdapter } from "../../../../../shared/infra/adapters/aws/sqs/SQSClientAdapter.js"
import { SQSController } from "../../../../../shared/presentation/controllers/aws/sqs/SQSController.js"
import { IQueueController } from "../../../../../shared/presentation/interfaces/queue/IQueueController.js"
import { sleep } from "../../../../../utils/sleep.js"
import { BuildEntryDataFromSQSMessage } from "../../../../../shared/data/useCases/fiscalObligations/entryData/BuildEntryDataFromSQSMessage.js"
import { FiscalOBligationsEventsPackage } from "../../../../../shared/data/useCases/fiscalObligations/eventsPackages/FiscalOBligartionsEventsPackage.js"
import { FiscalOBligationsOrchestrator } from "../../../../../shared/data/useCases/fiscalObligations/FiscalObligartionsOrchestrator.js"
import { WorkerThreadSucessEventHandlerfiscalOBligations } from "../../../../../shared/data/useCases/fiscalObligations/workers/listeners/WorkerThreadSucessEventHandlerFiscalOBligartions.js"
import { WorkerThreadFiscalOBligations } from "../../../../../shared/data/useCases/fiscalObligations/workers/WorkerThreadFiscalOBligartions.js"
import { WorkerThreadPoolFiscalOBligations } from "../../../../../shared/data/useCases/fiscalObligations/workers/WorkerThreadPoolFiscalOBligartions.js"
import { IFiscalObligationsEventsPackage } from "../../../../../shared/domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { RedisfiscalOBligationsPackageRepositoryAdapter } from "../../../../../shared/infra/databases/repositories/redis/RedisFiscalOBligartionsPackageRepositoryAdapter.js"

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

  await workerThreadManager.init("./dist/src/shared/data/useCases/fiscalObligations/workers/listeners/WorkerListenerToProcessFiscalOBligartions.js", 4)
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