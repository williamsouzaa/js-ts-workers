import { IQueue, TQueueAddItemResponse, TQueueItem, EQueuePackageStatus, TQueueEventData } from "../../../interfaces/application/queue/IQueue.js"


export class Queue implements IQueue {
  limitPerPackage!: number
  timeLimitToHoldingPackageInSecods!: number
  queue: TQueueItem = new Map()

  public setLimitPerPackage(limit: number): void {
    this.limitPerPackage = limit
  }

  public setTimeLimitToHoldingPackageInSecods(value: number): void {
    this.timeLimitToHoldingPackageInSecods = value
  }

  public addItem(keyGroup: string, eventId: string, data: any): TQueueAddItemResponse {
    const currentTs = Date.now()

    if (!this.queue.has(keyGroup)) {
      const lastPackageId = 1
      const firstPackage = { lastEventCreatedAt: currentTs, status: EQueuePackageStatus.STACKING, events: new Map().set(eventId, data) }
      this.queue.set(keyGroup, { lastPackageId,  package: new Map().set(lastPackageId, firstPackage) });
      return { keyGroup, package: { lastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
    }

    const group = this.queue.get(keyGroup)
    const lastPackage = group!.package.get(group!.lastPackageId)

    if (lastPackage!.events.size < this.limitPerPackage) {
      lastPackage!.lastEventCreatedAt = currentTs
      lastPackage!.events.set(eventId, data)
      return { keyGroup, package: { lastPackageId: group!.lastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
    }

    const newLastPackageId = group!.lastPackageId + 1
    group!.lastPackageId = newLastPackageId
    group!.package.set(newLastPackageId, { lastEventCreatedAt: currentTs, status: EQueuePackageStatus.STACKING, events: new Map().set(eventId, data) })
    return { keyGroup, package: { lastPackageId: newLastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
  }


  public deletePackageItem(keyGroup: string, packageIndex: number, eventId: string): void {
    if (!this.queue.has(keyGroup)) return
    const group = this.queue.get(keyGroup);
    const packageGroup = group!.package.get(packageIndex);

    if (!packageGroup!.events.has(eventId)) return

    packageGroup!.events.delete(eventId)
    if (packageGroup!.events.size == 0) {
      group!.package.delete(packageIndex)
    }
  }

  public deletePackage(keyGroup: string, packageIndex: number): void {
    if (!this.queue.has(keyGroup)) return
    const group = this.queue.get(keyGroup);

    if (!group!.package.has(packageIndex)) return
    group!.package.delete(packageIndex)

    if (group!.package.size == 0) {
      this.queue.delete(keyGroup)
    }
  }

  public getPackagesWithTimeLimitExpired(): Array<{keyGroup: string, packageIndex: number}> {
    const limitTime = this.timeLimitToHoldingPackageInSecods * 1000
    const packagesToProcess = []
    for (const [keyGroup, valueGroup] of this.queue){
      for (const [packageIndex, packageItem] of valueGroup.package) {
        if (packageItem.status === EQueuePackageStatus.PROCESSING) continue

        const millisecondsDiff = Date.now() - packageItem.lastEventCreatedAt
        if (millisecondsDiff >= limitTime) {
          packagesToProcess.push({keyGroup, packageIndex})
        }
      }
    }
    return packagesToProcess
  }

  public collectPackagesAlredyForProcess(): Array<{keyGroup: string, packageIndex: number}> {
    const packagesToProcess = []
    for (const [keyGroup, valueGroup] of this.queue){
      for (const [packageIndex, packageItem] of valueGroup.package) {
        if (packageItem.status === EQueuePackageStatus.PROCESSING) continue
        if (packageItem.events.size == this.limitPerPackage) {
          packagesToProcess.push({keyGroup, packageIndex})
        }
      }
    }
    return packagesToProcess
  }

  public getAndUpdateStatusPackagesToProcessing(keyGroup: string, packageIndex: number): Map<string, TQueueEventData> | void {
    if (!this.queue.has(keyGroup)) return
    const group = this.queue.get(keyGroup)

    if (!group!.package.has(packageIndex)) return
    const packageGroup = group!.package.get(packageIndex)

    if(packageGroup!.status === EQueuePackageStatus.PROCESSING) return
    packageGroup!.status = EQueuePackageStatus.PROCESSING

    return packageGroup!.events
  }
}
