import { TEventDetails } from "../IFiscalObligationsEventsPackage.js";

export interface IWritefiscalObligationsPackageRepository {
  writePackage(packageData: Array<{entryDataString: string, eventDetails: TEventDetails }>): Promise<void>
}