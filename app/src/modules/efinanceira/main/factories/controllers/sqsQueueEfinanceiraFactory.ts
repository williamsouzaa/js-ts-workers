import { SQSClientAdapter } from "../../../../../core/infra/adapters/aws/sqs/SQSClientAdapter.js"
import { SQSController } from "../../../../../core/presentation/controllers/aws/sqs/SQSController.js"
import { IQueueController } from "../../../../../core/presentation/interfaces/queue/IQueueController.js"
import { sleep } from "../../../../../utils/sleep.js"
import { BuildEntryDataFromSQSMessage } from "../../../../../core/data/useCases/fiscalObligations/entryData/BuildEntryDataFromSQSMessage.js"
import { FiscalObligationsOrchestrator } from "../../../../../core/data/useCases/fiscalObligations/FiscalObligationsOrchestrator.js"
import { RedisFiscalObligationsPackageRepositoryAdapter } from "../../../../../core/infra/databases/repositories/redis/RedisFiscalObligationsPackageRepositoryAdapter.js"
import { WorkerSuccessEventHandlerFiscalObligations } from "../../../../../core/data/useCases/fiscalObligations/workers/listeners/WorkerSuccessEventHandlerFiscalObligations.js"
import { WorkerFiscalObligations } from "../../../../../core/data/useCases/fiscalObligations/workers/WorkerFiscalObligations.js"
import { WorkerPoolFiscalObligations } from "../../../../../core/data/useCases/fiscalObligations/workers/WorkerPoolFiscalObligations.js"
import { WorkerErrorEventHandler } from "../../../../../core/data/useCases/application/workers/listeners/events/WorkerErrorEventHandler.js"
import { WorkerExitEventHandler } from "../../../../../core/data/useCases/application/workers/listeners/events/WorkerExitEventHandler.js"
import { AWS_SQS } from "../../../../../environment.js"
import { IFiscalObligationsEventsPackage } from "../../../../../core/domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { FiscalObligationsEventsPackage } from "../../../../../core/data/useCases/fiscalObligations/eventsPackages/FiscalObligationsEventsPackage.js"


function getIFiscalObligationsEventsPackageFactory(): IFiscalObligationsEventsPackage {
  const fiscalObligationsEventsPackage = new FiscalObligationsEventsPackage()
  fiscalObligationsEventsPackage.setLimitPerPackage(100)
  fiscalObligationsEventsPackage.setTimeLimitToHoldingPackageInSecods(50)
  return fiscalObligationsEventsPackage
}

export async function sqsQueueEfinanceiraFactory(): Promise<IQueueController> {
  const sqsObrigacaoEfinanceira = new SQSClientAdapter()
  sqsObrigacaoEfinanceira.setAWSSQSQueueUrl(AWS_SQS.EFINANCEIRA.INPUT.URL)
  sqsObrigacaoEfinanceira.setAWSClientSQS(AWS_SQS.EFINANCEIRA.INPUT.AWS_SQS_MAX_SOCKETS_REQUEST)

  const fiscalObligationsEventsPackage = getIFiscalObligationsEventsPackageFactory()

  const workerThreadPool = new WorkerPoolFiscalObligations(() => new WorkerFiscalObligations(
      new WorkerSuccessEventHandlerFiscalObligations(
        fiscalObligationsEventsPackage,
        new RedisFiscalObligationsPackageRepositoryAdapter()
      ),
      new WorkerErrorEventHandler(),
      new WorkerExitEventHandler(),
  ))

  await workerThreadPool.init("./dist/src/core/data/useCases/fiscalObligations/workers/listeners/WorkerListenerToProcessFiscalObligations.js", 6)
  await sleep(5000)
  console.log('[LOG][INFO] - sqsQueueEfinanceiraFactory - workerThreadManager:', workerThreadPool)

  return new SQSController(
    sqsObrigacaoEfinanceira,
    new BuildEntryDataFromSQSMessage(),
    new FiscalObligationsOrchestrator(
      fiscalObligationsEventsPackage,
      workerThreadPool,
      new RedisFiscalObligationsPackageRepositoryAdapter()
    )
  )
}