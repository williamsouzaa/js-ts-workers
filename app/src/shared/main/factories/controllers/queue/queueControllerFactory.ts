import { sqsQueueEfinanceiraFactory } from '../../../../../modules/efinanceira/presentation/factories/queue/aws/sqsQueueEfinanceiraFactory.js';
import { IQueueController } from '../../../../presentation/interfaces/IQueueController.js';

export async function queueControllerFactory(): Promise<Array<IQueueController>> {
  return [await sqsQueueEfinanceiraFactory()]

}