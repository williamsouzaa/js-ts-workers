import process  from "node:process";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SQSClientAdapter } from "../../../../../../../infra/adapters/aws/sqs/SQSClientAdapter.js";
import { SQSController } from "../../../../../../../presentation/controllers/queue/aws/sqs/SQSController.js";
import { ProcessManager } from "../../../../../../useCases/ProcessManager.js";
import { Queue } from "../../../../../../useCases/application/queue/Queue.js";
import { WorkerThreadManager } from "../../../../../../useCases/application/workers/WorkerThreadManager.js";
import { sleep } from "../../../../../../../utils/sleep.js";
import {
  IWorkerThreadErrorEventHandler,
  IWorkerThreadExitEventHandler,
  IWorkerThreadSucessEventHandler,
  TWorkerThreadSucessEventMessageReceived,
  TWorkerThreadSucessEventMessage,
  WorkerThread
} from "../../../../../../useCases/application/workers/WorkerThread.js";
import { IQueue } from "../../../../../../interfaces/application/queue/IQueue.js";



class WorkerThreadSucessEventHandlerXPTO implements IWorkerThreadSucessEventHandler {
  constructor(private queue: IQueue) {}

  public async handle(message: TWorkerThreadSucessEventMessage): Promise<void> {
    if (message.identifier === "queue") return this.handleQueueMessage(message)

    console.log(`caindo fora da classe aqui - Lidar com isso:`)
  }

  private async handleQueueMessage(message: TWorkerThreadSucessEventMessage): Promise<void> {
    if (!message.queue) throw new Error("Message queue is undefined in handleQueueMessage")
    if (message.queue.identifier !== "processPakage")  throw new Error("System expected to receive a message with identifier 'processPakage'")

    if (message.queue.message.identifier === "received") return this.handleQueueMessageReceived(message.queue.message)
    console.log(`caindo fora da classe aqui - Lidar com isso:`, message.queue.message)
  }

  private async handleQueueMessageReceived(message: TWorkerThreadSucessEventMessageReceived): Promise<void> {
    this.queue.clearEventsInPackage(message.keyGroup, message.packageIndex)
    console.log(`Pacote processado e eventos limpos da fila - keyGroup: ${message.keyGroup} - packageIndex: ${message.packageIndex}`)
  }
}

class WorkerThreadErrorEventHandlerXPTO implements IWorkerThreadErrorEventHandler {
  public async handle(message: any): Promise<void> {
    console.log("WorkerThreadErrorEventHandlerXPTO handle: ", message)
  }
}

class WorkerThreadExitEventHandlerXPTO implements IWorkerThreadExitEventHandler {
  public async handle(message: any): Promise<void> {
    console.log("WorkerThreadSucessEventHandlerXPTO handle: ", message)
  }
}


export async function sqsQueueEfinanceiraFactory() {
  const sqsObrigacaoTeste = new SQSClientAdapter()
  const queue = new Queue()

  const workerThreadManager = new WorkerThreadManager(() => new WorkerThread(
    new WorkerThreadSucessEventHandlerXPTO(queue),
    new WorkerThreadErrorEventHandlerXPTO(),
    new WorkerThreadExitEventHandlerXPTO()
  ))
  await workerThreadManager.init(4)

  await sleep(5000)
  console.log(`[LOG][INFO] - sqsQueueEfinanceiraFactory - workerThreadManager iniciado: `, workerThreadManager)

  sqsObrigacaoTeste.setAWSSQSQueueUrl(process.env.AWS_SQS_QUEUE_URL_EFINANCEIRA as string)

  sqsObrigacaoTeste.setAWSClientSQS(new SQSClient({
    region: "us-east-1",
    endpoint: process.env.AWS_SQS_QUEUE_ENDPOINT_EFINANCEIRA as string,
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test"
    }
  }))

  queue.setLimitPerPackage(2)
  queue.setTimeLimitToHoldingPackageInSecods(10)

  return new SQSController(sqsObrigacaoTeste, new ProcessManager(queue, workerThreadManager))
}