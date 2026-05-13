export type TQueueEventData = Object

export type TQueuePackage = {
  lastEventCreatedAt: number;
  status: E_QUEUE_PACKAGE_STATUS
  limitPackageSize: number
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

export enum E_QUEUE_PACKAGE_STATUS {
  STACKING = 'Stacking',
  PROCESSING = 'Processing'
}

export type TQueueMapKeysAndEvents = { keyGroup: string; packageIndex: number; events: Map<string, TQueueEventData> }
export type TQueueGroupPackageIndex = { keyGroup: string, packageIndex: number }

export interface IQueue {
  limitPerPackage: number
  timeLimitToHoldingPackageInSecods: number
  queue: TQueueItem

  addItem(keyGroup: string, eventId: string, data: any, customLimitPackage?: number): TQueueAddItemResponse
  deletePackageItem(keyGroup: string, packageIndex: number, eventId: string): void
  deletePackage(keyGroup: string, packageIndex: number): void
  getPackagesWithTimeLimitExpired(): Array<TQueueGroupPackageIndex>
  collectPackagesAlredyForProcess(): Array<TQueueGroupPackageIndex>
  getAndUpdateStatusPackagesToProcessing(keyGroup: string, packageIndex: number): TQueueMapKeysAndEvents | void
  clearEventsInPackage(keyGroup: string, packageIndex: number): void
}