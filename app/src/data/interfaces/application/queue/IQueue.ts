export type TQueueEventData = Object

export type TQueuePackage = {
  lastEventCreatedAt: number;
  status: EQueuePackageStatus
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

export enum EQueuePackageStatus {
  STACKING = 'Stacking',
  PROCESSING = 'Processing'
}


export interface IQueue {
  limitPerPackage: number
  timeLimitToHoldingPackageInSecods: number
  queue: TQueueItem

  addItem(keyGroup: string, eventId: string, data: any): TQueueAddItemResponse
  deletePackageItem(keyGroup: string, packageIndex: number, eventId: string): void
  deletePackage(keyGroup: string, packageIndex: number): void
  getPackagesWithTimeLimitExpired(): Array<{keyGroup: string, packageIndex: number}>
  collectPackagesAlredyForProcess(): Array<{keyGroup: string, packageIndex: number}>
  getAndUpdateStatusPackagesToProcessing(keyGroup: string, packageIndex: number): Map<string, TQueueEventData> | void
}