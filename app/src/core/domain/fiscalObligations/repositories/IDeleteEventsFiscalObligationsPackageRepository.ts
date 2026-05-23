import { TEventDetails, TPackageReference } from "../IFiscalObligationsEventsPackage.js";

export interface IDeleteEventsFiscalObligationsPackageRepository {
  deleteEvents(packageEventDatail: TPackageReference, eventsIds: Array<string>): Promise<void>
}