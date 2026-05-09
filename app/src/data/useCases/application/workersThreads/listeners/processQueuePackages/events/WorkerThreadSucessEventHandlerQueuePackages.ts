import { E_WORKER_PROCESS, E_WORKERS_PROCESS_QUEUE } from "../../../../../../../domain/useCases/names/index.js"
import { IQueue } from "../../../../../../interfaces/application/queue/IQueue.js"
import { IWorkerThreadSucessEventHandler } from "../../../../../../interfaces/application/workers/IWorkerThreadSucessEventHandler.js"
import { TPostMessageStrucData } from "../../../../../../interfaces/application/workers/TPostMessageStrucData.js"

export class WorkerThreadSucessEventHandlerQueuePackages implements IWorkerThreadSucessEventHandler {
  constructor(private queue: IQueue) {}

  public async handle(message: TPostMessageStrucData): Promise<void> {
    if (message.identifier === E_WORKER_PROCESS.QUEUE) return this.handleQueueMessage(message)

    throw new Error('tipo da mensagem ainda não suportado.')
  }

  private async handleQueueMessage(message: TPostMessageStrucData): Promise<void> {
    if (!message.queue) throw new Error("Message queue is undefined in handleQueueMessage")
    if (message.queue.identifier !== E_WORKERS_PROCESS_QUEUE.PROCESS_PACKAGE)  throw new Error("System expected to receive a message with identifier 'processPakage'")

    if (message.queue.message.identifier === "received") return this.handleQueueMessageReceived(message)
    console.log(`caindo fora da classe aqui - Lidar com isso:`, message.queue.message)
  }

  private async handleQueueMessageReceived(message: TPostMessageStrucData): Promise<void> {
    this.queue.clearEventsInPackage(message.queue!.processPackage.keyGroup, message.queue!.processPackage.packageIndex)
    console.log(`Pacote processado e eventos limpos da fila - keyGroup: ${message.queue!.processPackage.keyGroup} - packageIndex: ${message.queue!.processPackage.packageIndex}`)
  }
}