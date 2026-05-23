
export enum EQueueController {
  AWS_SQS = 'sqs',
  KAFKA = 'kafka'
}

export interface IQueueController {
  identifier: EQueueController
  handle(): Promise<void>
}