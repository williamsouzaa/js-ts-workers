import { sqsQueueEfinanceiraFactory } from "../../../../modules/efinanceira/main/factories/controllers/sqsQueueEfinanceiraFactory.js";
import { IQueueController } from "../../../presentation/interfaces/queue/IQueueController.js";

export async function queueControllerFactory(): Promise<Array<IQueueController>> {
  return [await sqsQueueEfinanceiraFactory()]

}