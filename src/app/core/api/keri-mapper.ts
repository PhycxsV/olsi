import type {
  AccreditationProvider,
  AccreditationStatus,
  ProviderDocument,
} from '../models/accreditation.model';
import type { ProviderCard } from '../../providers/provider.service';
import { pickNumber, pickString, unwrapEntity } from './keri-unwrap';
import type { AddProviderDraft } from '../../accreditation/add-provider-dialog/add-provider-dialog.component';

const DEFAULT_DOC_TITLES = [
  'SEC / DTI Registration',
  "Mayor's Permit",
  'BIR Registration',
  'Service Invoice / Billing Statement',
  'Sales Invoice',
  'Sketch / Map of Office and Garage',
  'Marine Insurance',
];

function mapUiStatusFromApi(s: string): AccreditationStatus {
  const u = s.toUpperCase().replace(/\s+/g, '_');
  if (u.includes('ACCREDIT') && !u.includes('IN') && !u.includes('REVIEW')) return 'Accredited';
  if (u.includes('REVIEW') || u.includes('IN_REVIEW')) return 'In Review';
  if (u.includes('REJECT')) return 'Rejected';
  if (u.includes('PEND')) return 'Pending';
  return 'Pending';
}

function mapDocumentStatusFromApi(s: string): ProviderDocument['status'] {
  const u = s.toUpperCase();
  if (u.includes('VERIF')) return 'Verified';
  if (u.includes('REJECT')) return 'Rejected';
  if (u.includes('REVIEW')) return 'Under Review';
  return 'Pending';
}

function mapUiRateType(api: string): string {
  const u = api.toUpperCase();
  if (u.includes('CALCUL') || u.includes('DISTANCE')) return 'Calculated Per Distance';
  return 'Fixed Rate';
}

function mapUiAppUsage(api: string): string {
  const u = api.toUpperCase();
  if (u.includes('AGGREGATOR')) return 'Uses Aggregator Rider App';
  return 'Uses Provider Rider App';
}

function parseServiceAreas(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(x => String(x).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function parseBooleanLike(raw: unknown): boolean | null {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') {
    if (raw === 1) return true;
    if (raw === 0) return false;
    return null;
  }
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'active', 'enabled'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'paused', 'inactive', 'disabled'].includes(normalized)) return false;
  }
  return null;
}

function mapDocuments(raw: unknown): ProviderDocument[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_DOC_TITLES.map(title => ({
      title,
      filename: '',
      uploadedAt: '',
      uploadedBy: '',
      status: 'Pending' as const,
    }));
  }
  return raw.map((item, i) => {
    const d = unwrapEntity(item);
    const title = pickString(d, ['title', 'name', 'label']) || DEFAULT_DOC_TITLES[i] || `Document ${i + 1}`;
    return {
      title,
      filename: pickString(d, ['filename', 'file_name', 'originalName']),
      uploadedAt: pickString(d, ['uploadedAt', 'uploaded_at', 'createdAt']) || '',
      uploadedBy: pickString(d, ['uploadedBy', 'uploaded_by']) || '',
      status: mapDocumentStatusFromApi(pickString(d, ['status', 'verification_status'])),
      note: pickString(d, ['note', 'notes']) || undefined,
      expiryDate: pickString(d, ['expiryDate', 'expiry_date', 'expiry']) || undefined,
      providerDocumentId: pickString(d, ['documentId', 'id', 'provider_document_id']) || undefined,
    };
  });
}

/**
 * Maps a single provider payload from GET /api/providers (shape may vary by backend version).
 */
export function mapAccreditationProvider(raw: unknown): AccreditationProvider | null {
  const r = unwrapEntity(raw);
  const apiResourceId = pickString(r, ['documentId', 'id', 'provider_document_id']);
  const apiProviderId = pickString(r, ['providerId', 'provider_id', 'numericId']);
  const name = pickString(r, ['company_name', 'companyName', 'name', 'title']);
  if (!name && !apiResourceId) return null;

  const statusRaw = pickString(r, [
    'provider_status',
    'providerStatus',
    'status',
    'accreditation_status',
    'accreditationStatus',
  ]);
  const status: AccreditationStatus = statusRaw ? mapUiStatusFromApi(statusRaw) : 'Pending';
  const documentId = pickString(r, ['documentId', 'id'])
  const documents = mapDocuments(r['documents'] ?? r['provider_documents'] ?? r['providerDocuments']);
  const verified = documents.filter(d => d.status === 'Verified').length;

  const rateTypeRaw = pickString(r, ['rate_type', 'rateType']);
  const appUsageRaw = pickString(r, ['app_usage', 'appUsage']);

  const bankName = pickString(r, ['bank_information', 'bankInformation', 'bank_name']);
  const bankAccountName = pickString(r, ['bank_account_name', 'bankAccountName']);
  const bank =
    bankName || bankAccountName
      ? {
          bankName: bankName || '—',
          accountName: bankAccountName || '—',
          accountNumber: pickString(r, ['bank_account_number', 'bankAccountNumber']) || '—',
          bankBranch: pickString(r, ['bank_branch', 'bankBranch']) || undefined,
        }
      : undefined;

  return {
    id: apiResourceId || pickString(r, ['slug']) || String(pickNumber(r, ['id'], Date.now())),
    name: name || '—',
    documentId,
    status,
    registrationId: pickString(r, ['registration_number', 'registrationNumber', 'registrationId']) || '—',
    address: pickString(r, ['address', 'office_address']) || '—',
    capacity: pickNumber(r, ['capacity'], 0),
    rateType: rateTypeRaw ? mapUiRateType(rateTypeRaw) : 'Fixed Rate',
    serviceAreas: parseServiceAreas(r['service_areas'] ?? r['serviceAreas']),
    documentsVerified: verified,
    documentsTotal: documents.length || 7,
    appUsage: appUsageRaw ? mapUiAppUsage(appUsageRaw) : 'Uses Provider Rider App',
    officeAddress: pickString(r, ['address', 'office_address', 'officeAddress']) || '—',
    garageAddress: pickString(r, ['garage_address', 'garageAddress']) || '—',
    contactPerson: pickString(r, ['contact_person', 'contactPerson']) || '—',
    phone: pickString(r, ['contact_phone', 'contactPhone', 'phone']) || '—',
    email: pickString(r, ['contact_email', 'contactEmail', 'email']) || '—',
    bank,
    documents,
    activeRiders: pickNumber(r, ['active_riders', 'activeRiders'], 0),
    accreditedOn: pickString(r, ['accredited_on', 'accreditedOn']) || undefined,
    registeredOn: pickString(r, ['registered_on', 'registeredOn', 'createdAt']) || undefined,
    apiUrl: pickString(r, ['api', 'api_url']) || undefined,
    apiTokenMasked: undefined,
    vehicleTypeIds: undefined,
    apiProviderId: apiProviderId || undefined,
    apiResourceId: apiResourceId || undefined,
  };
}

export function toApiRateType(ui: string): string {
  return ui === 'Calculated Per Distance' ? 'CALCULATED_PER_DISTANCE' : 'FIXED_RATE';
}

export function toApiAppUsage(ui: string): string {
  return ui.includes('Aggregator') ? 'USER_AGGREGATOR_RIDER_APP' : 'USES_PROVIDER_RIDER_APP';
}

/** Maps UI accreditation status to Strapi `provider_status` enum. */
export function toApiProviderStatus(status: AccreditationStatus): string {
  const m: Record<AccreditationStatus, string> = {
    Accredited: 'ACCREDITED',
    'In Review': 'IN_REVIEW',
    Pending: 'PENDING',
    Rejected: 'REJECTED',
  };
  return m[status] ?? 'PENDING';
}

/** Builds multipart body for POST /api/providers per Postman collection. */
export function buildCreateProviderFormData(draft: AddProviderDraft): FormData {
  const fd = new FormData();
  fd.append('company_name', draft.name.trim());
  fd.append('capacity', String(draft.capacity ?? 0));
  fd.append('registration_number', draft.registrationId.trim());
  fd.append('address', draft.officeAddress.trim());
  fd.append('garage_address', draft.garageAddress.trim());
  fd.append('rate_type', toApiRateType(draft.rateType));
  fd.append('app_usage', toApiAppUsage(draft.appUsage));
  fd.append('service_areas', (draft.serviceAreas || []).join(','));
  fd.append('contact_person', draft.contactPerson.trim());
  fd.append('contact_phone', draft.phone.trim());
  fd.append('contact_email', draft.email.trim());
  if (draft.apiUrl?.trim()) {
    fd.append('api', draft.apiUrl.trim());
  }
  if (draft.apiToken?.trim()) {
    fd.append('api_token', draft.apiToken.trim());
  }
  if (draft.bank?.bankName) {
    fd.append('bank_information', draft.bank.bankName);
    fd.append('bank_account_name', draft.bank.accountName || '');
    fd.append('bank_account_number', draft.bank.accountNumber || '');
    fd.append('bank_branch', draft.bank.bankBranch || '');
  }
  return fd;
}

export function formatExpiryApiDate(isoOrLocal: string | undefined): string {
  if (!isoOrLocal?.trim()) return '';
  const d = new Date(isoOrLocal);
  if (isNaN(d.getTime())) {
    const m = /^(\d{4}-\d{2}-\d{2})/.exec(isoOrLocal);
    return m ? m[1] : isoOrLocal.slice(0, 10);
  }
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

/** Maps accredited-provider list entry to operational ProviderCard (best-effort). */
export function mapAccreditedToProviderCard(raw: unknown): ProviderCard | null {
  const r = unwrapEntity(raw);
  const name = pickString(r, ['company_name', 'companyName', 'name']);
  const apiResourceId = pickString(r, ['documentId', 'id', 'provider_document_id']);
  if (!name) return null;
  const isActiveRaw =
    parseBooleanLike(r['is_active']) ??
    parseBooleanLike(r['isActive']) ??
    parseBooleanLike(r['active']) ??
    parseBooleanLike(r['enabled']);
  const isActive = isActiveRaw ?? String(r['status']).trim().toLowerCase() === 'active';
  const location = pickString(r, ['address', 'service_areas']) || '—';
  return {
    id: apiResourceId || pickString(r, ['id']) || name,
    name,
    documentId: apiResourceId || pickString(r, ['id']),
    location: typeof r['service_areas'] === 'string' ? String(r['service_areas']).split(',')[0]?.trim() || location : location,
    status: isActive ? 'Active' : 'Paused',
    integrationType: pickString(r, ['app_usage', 'appUsage'])
      ? 'USES_PROVIDER_RIDER_APP'
      : 'USER_AGGREGATOR_RIDER_APP',
    activeRiders: pickNumber(r, ['active_riders', 'activeRiders'], 0),
    totalRiders: pickNumber(r, ['capacity'], 25),
    avgTimeMin: 30,
    acceptancePercent: 90,
    slaPercent: 94,
    deliveriesToday: 0,
    apiResourceId: apiResourceId || undefined,
    is_active: true
  };
}
