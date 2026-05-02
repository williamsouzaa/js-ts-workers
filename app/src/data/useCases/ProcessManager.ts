import { TBusinessRule, TBusinessRuleEvent } from "../../domain/useCases/names/dataInput/TBusinessRule.js";
import { IWorkerThreadManager } from "../interfaces/application/workers/IWorkerThreadManager.js";

// ========================================================================================
// ========================================================================================
// ========================================================================================

export type TQueueEventData = {
  [key: string]: any;
}

export type TQueuePackage = {
  lastEventCreatedAt: number;
  events: Map<string, TQueueEventData>;
}
export type TQueueGroup = {
  lastPackageId: number
  package: Map<number, TQueuePackage>
};

export type TQueueItem = Map<string, TQueueGroup>

export type TQueueAddItemResponse = {
  keyGroup: string,
  package: {
    lastPackageId: number
    eventId: string,
    lastEventCreatedAt: number,
    data: any
  }
}

class Queue {
  static limitPerPackage: number = 7
  static queue: TQueueItem = new Map()

  addItem(keyGroup: string, eventId: string, data: any): TQueueAddItemResponse {
    const currentTs = Date.now()

    if (!Queue.queue.has(keyGroup)) {
      const lastPackageId = 1
      const firstPackage = { lastEventCreatedAt: currentTs, events: new Map().set(eventId, data) }
      Queue.queue.set(keyGroup, { lastPackageId,  package: new Map().set(lastPackageId, firstPackage) });
      return { keyGroup, package: { lastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
    }

    const group = Queue.queue.get(keyGroup)
    const lastPackage = group!.package.get(group!.lastPackageId)

    if (lastPackage!.events.size < Queue.limitPerPackage) {
      lastPackage!.lastEventCreatedAt = currentTs
      lastPackage!.events.set(eventId, data)
      return { keyGroup, package: { lastPackageId: group!.lastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
    }

    const newLastPackageId = group!.lastPackageId + 1
    group!.lastPackageId = newLastPackageId
    group!.package.set(newLastPackageId, { lastEventCreatedAt: currentTs, events: new Map().set(eventId, data) })
    return { keyGroup, package: { lastPackageId: newLastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
  }


  deletePackageItem(keyGroup: string, packageIndex: number, eventId: string): void {
    if (!Queue.queue.has(keyGroup)) return
    const group = Queue.queue.get(keyGroup);
    const packageGroup = group!.package.get(packageIndex);

    if (!packageGroup!.events.has(eventId)) return

    packageGroup!.events.delete(eventId)
    if (packageGroup!.events.size == 0) {
      group!.package.delete(packageIndex)
    }
  }

  deletePackage(keyGroup: string, packageIndex: number): void {
    if (!Queue.queue.has(keyGroup)) return
    const group = Queue.queue.get(keyGroup);
    const packageGroup = group!.package.get(packageIndex);

    if (!group!.package.has(packageIndex)) return
    group!.package.delete(packageIndex)

    if (group!.package.size == 0) {
      Queue.queue.delete(keyGroup)
    }
  }
}


// ========================================================================================
// ========================================================================================
// ========================================================================================
























export class ProcessManager {
  private workerThreadManager!: IWorkerThreadManager

  constructor(private workerThreadManager: IWorkerThreadManager) {}

  public async handle(businessRule: TBusinessRule): Promise<void> {
    const eventId = businessRule.event.id
    const keyGroup = this.buildKeyGroup(businessRule.event)




    console.log("eventId", eventId)
    console.log("keyGroup", keyGroup)
  }

  private buildKeyGroup(event: TBusinessRuleEvent): string {
    const keyParts = [
      event.obrigacao,
      event.cnpjEmpresa,
      event.codigoLayout,
      event.anoObrigacao,
      event.mesObrigacao,
      event.diaObrigacao
    ];

    console.log("keyParts >>", keyParts)
    return keyParts.filter(part => part !== undefined && part !== null).join('#');
  }
}
