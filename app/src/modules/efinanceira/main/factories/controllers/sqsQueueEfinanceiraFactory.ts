import { SQSClientAdapter } from "../../../../../shared/infra/adapters/aws/sqs/SQSClientAdapter.js"
import { SQSController } from "../../../../../shared/presentation/controllers/aws/sqs/SQSController.js"
import { IQueueController } from "../../../../../shared/presentation/interfaces/queue/IQueueController.js"
import { sleep } from "../../../../../utils/sleep.js"
import { BuildEntryDataFromSQSMessage } from "../../../../../shared/data/useCases/fiscalObligations/entryData/BuildEntryDataFromSQSMessage.js"
import { FiscalOBligationsEventsPackage } from "../../../../../shared/data/useCases/fiscalObligations/eventsPackages/FiscalOBligartionsEventsPackage.js"
import { FiscalOBligationsOrchestrator } from "../../../../../shared/data/useCases/fiscalObligations/FiscalObligationsOrchestrator.js"
import { IFiscalObligationsEventsPackage } from "../../../../../shared/domain/fiscalObligations/IFiscalObligationsEventsPackage.js"
import { RedisfiscalOBligationsPackageRepositoryAdapter } from "../../../../../shared/infra/databases/repositories/redis/RedisFiscalOBligartionsPackageRepositoryAdapter.js"
import { WorkerSucessEventHandlerfiscalOBligations } from "../../../../../shared/data/useCases/fiscalObligations/workers/listeners/WorkerSucessEventHandlerFiscalOBligartions.js"
import { WorkerFiscalOBligations } from "../../../../../shared/data/useCases/fiscalObligations/workers/WorkerFiscalOBligartions.js"
import { WorkerPoolFiscalOBligations } from "../../../../../shared/data/useCases/fiscalObligations/workers/WorkerPoolFiscalOBligartions.js"
import { WorkerErrorEventHandler } from "../../../../../shared/data/useCases/application/workers/listeners/events/WorkerErrorEventHandler.js"
import { WorkerExitEventHandler } from "../../../../../shared/data/useCases/application/workers/listeners/events/WorkerExitEventHandler.js"
import { AWS_SQS } from "../../../../../environment.js"


function getfiscalOBligationsEventsPackageFactory(): IFiscalObligationsEventsPackage {
  const fiscalOBligationsEventsPackage = new FiscalOBligationsEventsPackage()
  fiscalOBligationsEventsPackage.setLimitPerPackage(100)
  fiscalOBligationsEventsPackage.setTimeLimitToHoldingPackageInSecods(50)
  return fiscalOBligationsEventsPackage
}

export async function sqsQueueEfinanceiraFactory(): Promise<IQueueController> {
  const sqsObrigacaoEfinanceira = new SQSClientAdapter()
  sqsObrigacaoEfinanceira.setAWSSQSQueueUrl(AWS_SQS.EFINANCEIRA.INPUT.URL)
  sqsObrigacaoEfinanceira.setAWSClientSQS(AWS_SQS.EFINANCEIRA.INPUT.AWS_SQS_MAX_SOCKETS_REQUEST)

  const fiscalOBligationsEventsPackage = getfiscalOBligationsEventsPackageFactory()

  const workerThreadManager = new WorkerPoolFiscalOBligations(() => new WorkerFiscalOBligations(
      new WorkerSucessEventHandlerfiscalOBligations(
        fiscalOBligationsEventsPackage,
        new RedisfiscalOBligationsPackageRepositoryAdapter()
      ),
      new WorkerErrorEventHandler(),
      new WorkerExitEventHandler(),
  ))

  await workerThreadManager.init("./dist/src/shared/data/useCases/fiscalObligations/workers/listeners/WorkerListenerToProcessFiscalOBligartions.js", 6)
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