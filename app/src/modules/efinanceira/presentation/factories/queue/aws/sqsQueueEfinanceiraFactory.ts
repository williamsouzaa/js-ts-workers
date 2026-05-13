import process  from "node:process";
import { SQSClient } from "@aws-sdk/client-sqs";
import { IQueue } from "../../../../../../shared/data/interfaces/application/queue/IQueue.js";
import { BuildEntryDataFromSQSMessage } from "../../../../../../shared/data/useCases/application/entryData/BuildEntryDataFromSQSMessage.js";
import { Queue } from "../../../../../../shared/data/useCases/application/queue/Queue.js";
import { WorkerThreadErrorEventHandlerQueuePackages } from "../../../../../../shared/data/useCases/application/workersThreads/listeners/processQueuePackages/events/WorkerThreadErrorEventHandlerQueuePackages.js";
import { WorkerThreadExitEventHandlerQueuePackages } from "../../../../../../shared/data/useCases/application/workersThreads/listeners/processQueuePackages/events/WorkerThreadExitEventHandlerQueuePackages.js";
import { WorkerThreadSucessEventHandlerQueuePackages } from "../../../../../../shared/data/useCases/application/workersThreads/listeners/processQueuePackages/events/WorkerThreadSucessEventHandlerQueuePackages.js";
import { WorkerThread } from "../../../../../../shared/data/useCases/application/workersThreads/workers/WorkerThread.js";
import { WorkerThreadPool } from "../../../../../../shared/data/useCases/application/workersThreads/workers/WorkerThreadPool.js";
import { ProcessManager } from "../../../../../../shared/data/useCases/ProcessManager.js";
import { SQSClientAdapter } from "../../../../../../shared/infra/adapters/aws/sqs/SQSClientAdapter.js";
import { RedisQueuePackageRepositoryAdapter } from "../../../../../../shared/infra/databases/repositories/redis/RedisQueuePackageRepositoryAdapter.js";
import { SQSController } from "../../../../../../shared/presentation/controllers/aws/sqs/SQSController.js";
import { sleep } from "../../../../../../utils/sleep.js";


function queuePackagesFactory(): IQueue {
  const queue = new Queue()
  queue.setLimitPerPackage(2)
  queue.setTimeLimitToHoldingPackageInSecods(5)
  return queue
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

export async function sqsQueueEfinanceiraFactory() {
  const sqsObrigacaoEfinanceira = new SQSClientAdapter()
  sqsObrigacaoEfinanceira.setAWSSQSQueueUrl(process.env.AWS_SQS_QUEUE_URL_EFINANCEIRA as string)
  sqsObrigacaoEfinanceira.setAWSClientSQS(getInstanceAwsSkdSqsClient())

  const queue = queuePackagesFactory()

  const workerThreadManager = new WorkerThreadPool(() => new WorkerThread(
    new WorkerThreadSucessEventHandlerQueuePackages(queue),
    new WorkerThreadErrorEventHandlerQueuePackages(),
    new WorkerThreadExitEventHandlerQueuePackages(),
  ))

  await workerThreadManager.init("./dist/src/data/useCases/application/workersThreads/listeners/processQueuePackages/WorkerListenerToProcessQueuePackage.js", 4)
  await sleep(5000)
  console.log('[LOG][INFO] - sqsQueueEfinanceiraFactory - workerThreadManager:', workerThreadManager)

  return new SQSController(
    sqsObrigacaoEfinanceira,
    new BuildEntryDataFromSQSMessage(),
    new ProcessManager(
      queue,
      workerThreadManager,
      new RedisQueuePackageRepositoryAdapter()
    )
  )
}