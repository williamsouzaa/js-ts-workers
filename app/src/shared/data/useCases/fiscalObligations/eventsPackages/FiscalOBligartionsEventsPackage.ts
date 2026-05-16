import { E_EVENT_PACKAGE_STATUS, IFiscalObligationsEventsPackage, TEventDetails, TGroupPackagesItems, TProcessablePackage } from "../../../../domain/fiscalObligations/IFiscalObligationsEventsPackage.js"

export class FiscalOBligationsEventsPackage implements IFiscalObligationsEventsPackage {
  limitPerPackage!: number
  timeLimitToHoldingPackageInSecods!: number
  events: TGroupPackagesItems = new Map()

  public setLimitPerPackage(limit: number): void {
    this.limitPerPackage = limit
  }

  public setTimeLimitToHoldingPackageInSecods(value: number): void {
    this.timeLimitToHoldingPackageInSecods = value
  }

  public addItem(keyGroup: string, eventId: string, data: any, customLimitPackage: number | undefined): TEventDetails {
    const currentTs = Date.now()

    const limitPackageSize = !!customLimitPackage ? customLimitPackage : this.limitPerPackage

    if (!this.events.has(keyGroup)) {
      const lastPackageId = 1
      const firstPackage = {
        lastEventCreatedAt: currentTs,
        status: E_EVENT_PACKAGE_STATUS.STACKING,
        limitPackageSize,
        events: new Map().set(eventId, data)
      }
      this.events.set(keyGroup, { lastPackageId,  package: new Map().set(lastPackageId, firstPackage) });
      return { keyGroup, package: { lastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
    }

    const group = this.events.get(keyGroup)
    const lastPackage = group!.package.get(group!.lastPackageId)

    if (lastPackage!.events.size <= this.limitPerPackage) {
      lastPackage!.lastEventCreatedAt = currentTs
      lastPackage!.events.set(eventId, data)
      return { keyGroup, package: { lastPackageId: group!.lastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
    }

    const newLastPackageId = group!.lastPackageId + 1
    group!.lastPackageId = newLastPackageId
    group!.package.set( newLastPackageId, {
      lastEventCreatedAt: currentTs,
      limitPackageSize, status: E_EVENT_PACKAGE_STATUS.STACKING,
      events: new Map().set(eventId, data)
    })
    return { keyGroup, package: { lastPackageId: newLastPackageId, eventId, lastEventCreatedAt: currentTs, data } }
  }


  public deletePackageItem(keyGroup: string, packageIndex: number, eventId: string): void {
    if (!this.events.has(keyGroup)) return
    const group = this.events.get(keyGroup);
    const packageGroup = group!.package.get(packageIndex);

    if (!packageGroup!.events.has(eventId)) return

    packageGroup!.events.delete(eventId)
    if (packageGroup!.events.size == 0) {
      group!.package.delete(packageIndex)
    }
  }

  public deletePackage(keyGroup: string, packageIndex: number): void {
    if (!this.events.has(keyGroup)) return
    const group = this.events.get(keyGroup);

    if (!group!.package.has(packageIndex)) return
    group!.package.delete(packageIndex)

    if (group!.package.size == 0) {
      this.events.delete(keyGroup)
    }
  }

  public getPackagesWithTimeLimitExpired(): Array<{keyGroup: string, packageIndex: number}> {
    const limitTime = this.timeLimitToHoldingPackageInSecods * 1000
    const packagesToProcess = []
    for (const [keyGroup, valueGroup] of this.events){
      for (const [packageIndex, packageItem] of valueGroup.package) {
        if (packageItem.status === E_EVENT_PACKAGE_STATUS.PROCESSING) continue

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
    for (const [keyGroup, valueGroup] of this.events){
      for (const [packageIndex, packageItem] of valueGroup.package) {
        if (packageItem.status === E_EVENT_PACKAGE_STATUS.PROCESSING) continue
        if (packageItem.events.size == packageItem.limitPackageSize) {
          packagesToProcess.push({keyGroup, packageIndex})
        }
      }
    }
    return packagesToProcess
  }

  public getAndUpdateStatusPackagesToProcessing(keyGroup: string, packageIndex: number): TProcessablePackage | void{
    if (!this.events.has(keyGroup)) return
    const group = this.events.get(keyGroup)

    if (!group!.package.has(packageIndex)) return
    const packageGroup = group!.package.get(packageIndex)

    if(packageGroup!.status === E_EVENT_PACKAGE_STATUS.PROCESSING) return
    packageGroup!.status = E_EVENT_PACKAGE_STATUS.PROCESSING

    return { keyGroup, packageIndex, events: packageGroup!.events}
  }

  public clearEventsInPackage(keyGroup: string, packageIndex: number): void {
    if (!this.events.has(keyGroup)) return
    const group = this.events.get(keyGroup)
    if (!group!.package.has(packageIndex)) return
    const packageGroup = group!.package.get(packageIndex)
    packageGroup!.events.clear()
  }
}
