import { TEventDetails } from "../IFiscalObligationsEventsPackage.js";

export interface IWritefiscalOBligationsPackageRepository {
  writePackage(packageData: Array<{entryDataString: string, eventDetails: TEventDetails }>): Promise<void>
}