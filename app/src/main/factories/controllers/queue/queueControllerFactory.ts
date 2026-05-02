import { IQueueController } from '../../../../presentation/interfaces/IQueueController.js';
import { sqsQueueEfinanceiraFactory } from '../../../../data/modules/efinanceira/presentation/factories/queue/aws/sqsQueueEfinanceiraFactory.js';

export function queueControllerFactory(): Array<IQueueController> {
  return [sqsQueueEfinanceiraFactory()]
}