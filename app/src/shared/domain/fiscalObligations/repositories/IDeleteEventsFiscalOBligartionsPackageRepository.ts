import { TEventDetails, TPackageReference } from "../IFiscalObligationsEventsPackage.js";

export interface IDeleteEventsFiscalOBligartionsPackageRepository {
  deleteEvents(packageEventDatail: TPackageReference, eventsIds: Array<string>): Promise<void>
}