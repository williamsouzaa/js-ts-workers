export type TEventData = Object

export type TEventsPackage = {
  lastEventCreatedAt: number;
  status: E_EVENT_PACKAGE_STATUS
  limitPackageSize: number
  events: Map<string, TEventData>;
}
export type TEventsGroup = {
  lastPackageId: number
  package: Map<number, TEventsPackage>
};

export type TGroupPackagesItems = Map<string, TEventsGroup>

export type TEventPackageInfo = {
  lastPackageId: number
  eventId: string,
  lastEventCreatedAt: number,
  data: any
}

export type TEventDetails = {
  keyGroup: string,
  package: TEventPackageInfo
}

export enum E_EVENT_PACKAGE_STATUS {
  STACKING = 'Stacking',
  PROCESSING = 'Processing'
}

export type TPackageReference = { keyGroup: string, packageIndex: number }

export type TProcessablePackage = TPackageReference & {
  events: Map<string, TEventData>;
}

export interface IFiscalObligationsEventsPackage {
  limitPerPackage: number
  timeLimitToHoldingPackageInSecods: number
  events: TGroupPackagesItems

  addItem(keyGroup: string, eventId: string, data: any, customLimitPackage?: number): TEventDetails
  deletePackageItem(keyGroup: string, packageIndex: number, eventId: string): void
  deletePackage(keyGroup: string, packageIndex: number): void
  getPackagesWithTimeLimitExpired(): Array<TPackageReference>
  collectPackagesAlredyForProcess(): Array<TPackageReference>
  getAndUpdateStatusPackagesToProcessing(keyGroup: string, packageIndex: number): TProcessablePackage | void
  clearEventsInPackage(keyGroup: string, packageIndex: number): void
}
