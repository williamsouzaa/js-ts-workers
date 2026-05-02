
export enum EQueueController {
  AWS_SQS = 'sqs',
  KAFKA = 'kafka'
}

export interface IQueueController {
  indentifier: EQueueController
  handle(): Promise<void>
}