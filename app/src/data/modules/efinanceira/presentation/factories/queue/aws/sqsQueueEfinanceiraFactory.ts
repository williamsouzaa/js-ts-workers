import process  from "node:process";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SQSClientAdapter } from "../../../../../../../infra/adapters/aws/sqs/SQSClientAdapter.js";
import { SQSController } from "../../../../../../../presentation/controllers/queue/aws/sqs/SQSController.js";
import { ProcessManager } from "../../../../../../useCases/ProcessManager.js";
import { Queue } from "../../../../../../useCases/application/queue/Queue.js";


export function sqsQueueEfinanceiraFactory() {
  const sqsObrigacaoTeste = new SQSClientAdapter()

  sqsObrigacaoTeste.setAWSSQSQueueUrl(process.env.AWS_SQS_QUEUE_URL_EFINANCEIRA as string)

  sqsObrigacaoTeste.setAWSClientSQS(new SQSClient({
    region: "us-east-1",
    endpoint: process.env.AWS_SQS_QUEUE_ENDPOINT_EFINANCEIRA as string,
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test"
    }
  }))

  const queue = new Queue()
  queue.setLimitPerPackage(2)
  queue.setTimeLimitToHoldingPackageInSecods(10)

  return new SQSController(sqsObrigacaoTeste, new ProcessManager(queue))
}