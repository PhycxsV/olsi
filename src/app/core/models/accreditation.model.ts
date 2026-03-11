export type AccreditationStatus = 'Accredited' | 'In Review' | 'Pending' | 'Rejected';

export type DocumentStatus = 'Verified' | 'Pending' | 'Rejected' | 'Under Review';

export interface ProviderDocument {
  title: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  status: DocumentStatus;
  note?: string;
  /** Expiry date for alerts (ISO datetime-local format: yyyy-MM-ddTHH:mm) */
  expiryDate?: string;
}

export interface BankInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankBranch?: string;
}

export interface AccreditationProvider {
  id: string;
  name: string;
  status: AccreditationStatus;
  registrationId: string;
  address: string;
  capacity: number;
  rateType: string;
  serviceAreas: string[];
  documentsVerified: number;
  documentsTotal: number;
  appUsage: string;
  officeAddress: string;
  garageAddress: string;
  contactPerson: string;
  phone: string;
  email: string;
  bank?: BankInfo;
  documents: ProviderDocument[];
  activeRiders?: number;
  accreditedOn?: string;
  registeredOn?: string;
  apiUrl?: string;
  apiTokenMasked?: string;
  vehicleTypeIds?: string[];
}

export interface DocumentExpiringSoon {
  providerId: string;
  providerName: string;
  documentTitle: string;
  filename: string;
  expiryDate: string;
  daysLeft: number;
}
