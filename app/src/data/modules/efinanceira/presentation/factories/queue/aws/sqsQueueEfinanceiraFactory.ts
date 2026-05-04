import process  from "node:process";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SQSClientAdapter } from "../../../../../../../infra/adapters/aws/sqs/SQSClientAdapter.js";
import { SQSController } from "../../../../../../../presentation/controllers/queue/aws/sqs/SQSController.js";
import { ProcessManager } from "../../../../../../useCases/ProcessManager.js";
import { Queue } from "../../../../../../useCases/application/queue/Queue.js";
import { WorkerThreadManager } from "../../../../../../useCases/application/workersThreads/workers/WorkerThreadManager.js";
import { sleep } from "../../../../../../../utils/sleep.js";
import { WorkerThread } from "../../../../../../useCases/application/workersThreads/workers/WorkerThread.js";
import { WorkerThreadSucessEventHandlerQueuePackages } from "../../../../../../../data/useCases/application/workersThreads/listeners/processQueuePackages/events/WorkerThreadSucessEventHandlerQueuePackages.js"
import { WorkerThreadErrorEventHandlerQueuePackages } from "../../../../../../../data/useCases/application/workersThreads/listeners/processQueuePackages/events/WorkerThreadErrorEventHandlerQueuePackages.js"
import { WorkerThreadExitEventHandlerQueuePackages } from "../../../../../../../data/useCases/application/workersThreads/listeners/processQueuePackages/events/WorkerThreadExitEventHandlerQueuePackages.js"
import { IQueue } from "../../../../../../interfaces/application/queue/IQueue.js";



function queuePackagesFactory(): IQueue {
  const queue = new Queue()
  queue.setLimitPerPackage(2)
  queue.setTimeLimitToHoldingPackageInSecods(10)
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

  const workerThreadManager = new WorkerThreadManager(() => new WorkerThread(
    new WorkerThreadSucessEventHandlerQueuePackages(queue),
    new WorkerThreadErrorEventHandlerQueuePackages(),
    new WorkerThreadExitEventHandlerQueuePackages(),
  ))

  await workerThreadManager.init("./dist/src/data/useCases/application/workersThreads/listeners/processQueuePackages/WorkerListenerToProcessQueuePackage.js", 4)
  await sleep(5000)

  return new SQSController(sqsObrigacaoEfinanceira, new ProcessManager(queue, workerThreadManager))
}