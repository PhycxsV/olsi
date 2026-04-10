import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProviderDetailDialogComponent } from './provider-detail-dialog/provider-detail-dialog.component';
import { AddProviderDialogComponent, AddProviderDraft } from './add-provider-dialog/add-provider-dialog.component';
import { AccreditationService } from '../core/services/accreditation.service';
import { VEHICLE_TYPES } from '../core/vehicle.model';
import { CHARGING_TYPES } from '../core/charging.model';
import { ProviderRateService } from '../core/services/provider-rate.service';
import type { ProviderRateCsvError, ProviderRateRow } from '../core/models/provider-rate.model';
import type { AccreditationProvider, AccreditationStatus, ProviderDocument } from '../core/models/accreditation.model';
import { KeriProvidersApiService } from '../core/api/keri-providers-api.service';

export interface StatusCardItem {
  label: string;
  value: number;
  type: 'total' | 'accredited' | 'in_review' | 'pending' | 'rejected';
}

@Component({
  selector: 'app-accreditation',
  templateUrl: './accreditation.component.html',
  styleUrls: ['./accreditation.component.scss'],
})
export class AccreditationComponent implements OnInit {
  @ViewChild('rateCsvImportDialog') rateCsvImportDialogTemplate!: TemplateRef<unknown>;
  searchText = '';
  statusFilter: AccreditationStatus | '' = '';
  viewMode: 'cards' | 'table' = 'cards';
  readonly tableColumns: string[] = ['name', 'registrationId', 'status', 'capacity', 'documents', 'serviceAreas', 'actions'];
  readonly rateCsvHeaders = ['provider name', 'vehicle type', 'charging type', 'rate'];
  selectedRateCsvFileName = '';
  rateCsvImportErrors: ProviderRateCsvError[] = [];
  rateCsvImportSuccess = '';
  rateCsvPreviewRows: ProviderRateRow[] = [];
  providerRates: ProviderRateRow[] = [];
  providersLoading = false;
  providersError = '';

  get statusCards(): StatusCardItem[] {
    const list = this.providers;
    return [
      { label: 'Total', value: list.length, type: 'total' },
      { label: 'Accredited', value: list.filter(p => p.status === 'Accredited').length, type: 'accredited' },
      { label: 'In Review', value: list.filter(p => p.status === 'In Review').length, type: 'in_review' },
      { label: 'Pending', value: list.filter(p => p.status === 'Pending').length, type: 'pending' },
      { label: 'Rejected', value: list.filter(p => p.status === 'Rejected').length, type: 'rejected' },
    ];
  }

  /** Returns all documents in Pending state (verification done via View modal). */
  private static defaultDocuments(): ProviderDocument[] {
    const titles = ['SEC / DTI Registration', "Mayor's Permit", 'BIR Registration', 'Service Invoice / Billing Statement', 'Sales Invoice', 'Sketch / Map of Office and Garage', 'Marine Insurance'];
    const filenames = ['sec-dti-registration.pdf', 'mayors-permit.pdf', 'bir-registration.pdf', 'service-invoice.pdf', 'sales-invoice.pdf', 'office-garage-sketch.pdf', 'marine-insurance.pdf'];
    return titles.map((title, i) => ({
      title,
      filename: filenames[i],
      uploadedAt: '',
      uploadedBy: '',
      status: 'Pending' as const,
      note: undefined,
      expiryDate: undefined,
    }));
  }

  providers: AccreditationProvider[] = [
    { id: '1', name: 'SpeedRiders Logistics Inc.', status: 'Accredited', registrationId: 'SEC-2020-00123456', address: '123 Logistics Hub, Makati City', capacity: 50, rateType: 'Calculated Per Distance', serviceAreas: ['Metro Manila', 'Cavite', 'Laguna'], documentsVerified: 0, documentsTotal: 7, appUsage: 'Uses Provider Rider App', officeAddress: '123 Logistics Hub, Makati City', garageAddress: '123 Logistics Hub, Makati City', contactPerson: 'Juan Dela Cruz', phone: '+63 912 345 6789', email: 'juan@speedriders.ph', bank: { bankName: 'BDO', accountName: 'SpeedRiders Logistics Inc.', accountNumber: '**** 1234', bankBranch: 'Makati Branch' }, documents: AccreditationComponent.defaultDocuments(), activeRiders: 42, accreditedOn: 'April 10, 2023', registeredOn: 'March 15, 2023', apiUrl: 'https://speedriders.ph/api', apiTokenMasked: 'sr_live_toke........', vehicleTypeIds: ['motorcycle', 'van'] },
    { id: '2', name: 'MetroFleet Delivery Services', status: 'Accredited', registrationId: 'DTI-2019-00789012', address: '789 Commerce Road, Pasig City', capacity: 35, rateType: 'Fixed Rate', serviceAreas: ['Metro Manila', 'Rizal'], documentsVerified: 0, documentsTotal: 7, appUsage: 'Uses Aggregator Rider App', officeAddress: '789 Commerce Road, Pasig City', garageAddress: '789 Commerce Road, Pasig City', contactPerson: 'Maria Santos', phone: '+63 917 876 5432', email: 'maria@metrofleet.ph', bank: { bankName: 'BPI', accountName: 'MetroFleet Delivery Services', accountNumber: '**** 5678', bankBranch: 'Pasig Branch' }, documents: AccreditationComponent.defaultDocuments(), activeRiders: 30, accreditedOn: 'April 15, 2023', registeredOn: 'March 20, 2023', apiUrl: 'https://metrofleet.ph/api', apiTokenMasked: 'mf_live_toke........', vehicleTypeIds: ['van'] },
    { id: '3', name: 'SwiftDeliver Corp.', status: 'Accredited', registrationId: 'SEC-2021-00345678', address: '555 Business Park, BGC Taguig', capacity: 25, rateType: 'Calculated Per Distance', serviceAreas: ['Makati', 'BGC', 'Pasig', 'Taguig'], documentsVerified: 0, documentsTotal: 7, appUsage: 'Uses Provider Rider App', officeAddress: '555 Business Park, BGC Taguig', garageAddress: '777 Depot Lane, Taguig City', contactPerson: 'Pedro Reyes', phone: '+63 919 345 6789', email: 'pedro@swiftdeliver.ph', bank: { bankName: 'UnionBank', accountName: 'SwiftDeliver Corp.', accountNumber: '**** 9012', bankBranch: 'BGC Branch' }, documents: AccreditationComponent.defaultDocuments(), activeRiders: 22, accreditedOn: 'May 1, 2023', registeredOn: 'April 5, 2023', apiUrl: 'https://swiftdeliver.ph/api', apiTokenMasked: 'sd_live_toke........', vehicleTypeIds: ['motorcycle', 'van'] },
    { id: '4', name: 'QuickHaul Transport', status: 'In Review', registrationId: 'DTI-2022-00456789', address: '456 Transport Ave, Quezon City', capacity: 40, rateType: 'Fixed Rate', serviceAreas: ['Quezon City', 'Caloocan', 'Valenzuela'], documentsVerified: 0, documentsTotal: 7, appUsage: 'Uses Provider Rider App', officeAddress: '456 Transport Ave, Quezon City', garageAddress: '456 Transport Ave, Quezon City', contactPerson: 'Ana Lopez', phone: '+63 918 111 2233', email: 'ana@quickhaul.ph', bank: { bankName: 'Landbank', accountName: 'QuickHaul Transport', accountNumber: '**** 3456', bankBranch: 'Quezon City Branch' }, documents: AccreditationComponent.defaultDocuments(), activeRiders: 28, registeredOn: 'June 12, 2023', apiUrl: 'https://quickhaul.ph/api', apiTokenMasked: 'qh_live_toke........', vehicleTypeIds: ['motorcycle'] },
    { id: '5', name: 'ExpressWay Couriers', status: 'Pending', registrationId: 'SEC-2023-00567890', address: '321 Express Blvd, Mandaluyong', capacity: 30, rateType: 'Calculated Per Distance', serviceAreas: ['Metro Manila'], documentsVerified: 0, documentsTotal: 7, appUsage: 'Uses Aggregator Rider App', officeAddress: '321 Express Blvd, Mandaluyong', garageAddress: '321 Express Blvd, Mandaluyong', contactPerson: 'Carlos Gomez', phone: '+63 919 444 5566', email: 'carlos@expressway.ph', bank: { bankName: 'MetroBank', accountName: 'ExpressWay Couriers', accountNumber: '**** 7890', bankBranch: 'Mandaluyong Branch' }, documents: AccreditationComponent.defaultDocuments(), activeRiders: 0, registeredOn: 'Aug 1, 2023', apiUrl: 'https://expressway.ph/api', apiTokenMasked: 'ew_live_toke........', vehicleTypeIds: ['van', '6-wheeler'] },
    { id: '6', name: 'CityLogix Inc.', status: 'Rejected', registrationId: 'DTI-2021-00234567', address: '888 Industrial Zone, Paranaque', capacity: 20, rateType: 'Fixed Rate', serviceAreas: ['Paranaque', 'Las Pinas'], documentsVerified: 0, documentsTotal: 7, appUsage: 'Uses Provider Rider App', officeAddress: '888 Industrial Zone, Paranaque', garageAddress: '888 Industrial Zone, Paranaque', contactPerson: 'Elena Torres', phone: '+63 920 777 8899', email: 'elena@citylogix.ph', bank: { bankName: 'Security Bank', accountName: 'CityLogix Inc.', accountNumber: '**** 2468', bankBranch: 'Paranaque Branch' }, documents: AccreditationComponent.defaultDocuments(), activeRiders: 0, registeredOn: 'Feb 10, 2023', apiUrl: 'https://citylogix.ph/api', apiTokenMasked: 'cl_live_toke........', vehicleTypeIds: ['motorcycle', 'van'] },
  ];

  statusFilterOptions: { value: '' | AccreditationStatus; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'Accredited', label: 'Accredited' },
    { value: 'In Review', label: 'In Review' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  constructor(
    private dialog: MatDialog,
    private accreditationService: AccreditationService,
    private providerRateService: ProviderRateService,
    private keriApi: KeriProvidersApiService,
  ) {}

  ngOnInit(): void {
    this.providerRates = this.providerRateService.getRates();
    if (this.keriApi.isConfigured()) {
      this.reloadProvidersFromApi();
      return;
    }
    if (this.accreditationService.getProviders().length === 0) {
      this.accreditationService.setProviders(this.providers);
    } else {
      this.providers = [...this.accreditationService.getProviders()];
    }
  }

  private reloadProvidersFromApi(): void {
    this.providersLoading = true;
    this.providersError = '';
    this.keriApi.getAllProviders().subscribe({
      next: list => {
        this.providers = list;
        this.accreditationService.setProviders(this.providers);
        this.providersLoading = false;
      },
      error: err => {
        this.providersError =
          err?.error?.error?.message || err?.error?.message || err?.message || 'Failed to load providers.';
        this.providersLoading = false;
      },
    });
  }

  get filteredProviders(): AccreditationProvider[] {
    let list = [...this.providers];
    if (this.statusFilter) {
      list = list.filter(p => p.status === this.statusFilter);
    }
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.registrationId.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    }
    return list;
  }

  setViewMode(mode: 'cards' | 'table'): void {
    this.viewMode = mode;
  }

  onRateCsvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedRateCsvFileName = file?.name || '';
    this.rateCsvPreviewRows = [];
    this.rateCsvImportErrors = [];
    this.rateCsvImportSuccess = '';
  }

  openRateCsvImportDialog(): void {
    this.selectedRateCsvFileName = '';
    this.rateCsvImportErrors = [];
    this.rateCsvPreviewRows = [];
    this.dialog.open(this.rateCsvImportDialogTemplate, {
      width: '820px',
      maxWidth: '95vw',
    });
  }

  previewProviderRatesCsv(fileInput: HTMLInputElement): void {
    const file = fileInput.files?.[0];
    if (!file) {
      this.rateCsvImportErrors = [{ row: 0, message: 'Please choose a CSV file to import.' }];
      this.rateCsvPreviewRows = [];
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const csvText = typeof reader.result === 'string' ? reader.result : '';
      const result = this.parseAndValidateProviderRatesCsv(csvText);
      if (result.errors.length) {
        this.rateCsvImportErrors = result.errors;
        this.rateCsvPreviewRows = [];
        return;
      }
      this.rateCsvPreviewRows = result.rows;
      this.rateCsvImportErrors = [];
    };
    reader.onerror = () => {
      this.rateCsvImportErrors = [{ row: 0, message: 'Failed to read CSV file.' }];
      this.rateCsvPreviewRows = [];
    };
    reader.readAsText(file);
  }

  confirmImportProviderRatesCsv(fileInput: HTMLInputElement): void {
    if (!this.rateCsvPreviewRows.length) {
      this.rateCsvImportErrors = [{ row: 0, message: 'Please preview a valid CSV file before importing.' }];
      return;
    }
    this.providerRateService.replaceAll(this.rateCsvPreviewRows);
    this.providerRates = this.providerRateService.getRates();
    this.rateCsvImportSuccess = `Imported ${this.rateCsvPreviewRows.length} provider rate row(s).`;
    this.rateCsvImportErrors = [];
    this.rateCsvPreviewRows = [];
    this.dialog.closeAll();
    fileInput.value = '';
    this.selectedRateCsvFileName = '';
  }

  private parseAndValidateProviderRatesCsv(csvText: string): { rows: ProviderRateRow[]; errors: ProviderRateCsvError[] } {
    const lines = csvText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (!lines.length) {
      return { rows: [], errors: [{ row: 1, message: 'CSV file is empty.' }] };
    }

    const headerCells = this.parseCsvLine(lines[0]).map(cell => cell.trim().toLowerCase());
    const headerIsValid = headerCells.length === this.rateCsvHeaders.length &&
      this.rateCsvHeaders.every((header, idx) => headerCells[idx] === header);
    if (!headerIsValid) {
      return {
        rows: [],
        errors: [{ row: 1, message: `Invalid CSV header. Expected: ${this.rateCsvHeaders.join(', ')}` }],
      };
    }

    const knownProviders = new Map<string, string>(
      this.providers.map(provider => [provider.name.trim().toLowerCase(), provider.name.trim()]),
    );
    const allowedVehicleTypes = new Set<string>([
      ...VEHICLE_TYPES.map(v => v.id.toLowerCase()),
      ...VEHICLE_TYPES.map(v => v.label.toLowerCase()),
    ]);
    const allowedChargingTypes = new Set<string>([
      ...CHARGING_TYPES.map(c => c.id.toLowerCase()),
      ...CHARGING_TYPES.map(c => c.label.toLowerCase()),
    ]);

    const errors: ProviderRateCsvError[] = [];
    const rows: ProviderRateRow[] = [];
    const seenKeys = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i + 1;
      const cells = this.parseCsvLine(lines[i]).map(cell => cell.trim());
      if (cells.length !== this.rateCsvHeaders.length) {
        errors.push({ row: rowNumber, message: 'Invalid column count.' });
        continue;
      }

      const [providerNameRaw, vehicleTypeRaw, chargingTypeRaw, rateRaw] = cells;
      if (!providerNameRaw || !vehicleTypeRaw || !chargingTypeRaw || !rateRaw) {
        errors.push({ row: rowNumber, message: 'All columns are required.' });
        continue;
      }

      const providerNameKey = providerNameRaw.toLowerCase();
      const vehicleTypeKey = vehicleTypeRaw.toLowerCase();
      const chargingTypeKey = chargingTypeRaw.toLowerCase();
      const canonicalProviderName = knownProviders.get(providerNameKey);
      if (!canonicalProviderName) {
        errors.push({ row: rowNumber, message: `Unknown provider name: ${providerNameRaw}` });
        continue;
      }
      if (!allowedVehicleTypes.has(vehicleTypeKey)) {
        errors.push({ row: rowNumber, message: `Unknown vehicle type: ${vehicleTypeRaw}` });
        continue;
      }
      if (!allowedChargingTypes.has(chargingTypeKey)) {
        errors.push({ row: rowNumber, message: `Unknown charging type: ${chargingTypeRaw}` });
        continue;
      }

      const rate = Number(rateRaw);
      if (!Number.isFinite(rate) || rate < 0) {
        errors.push({ row: rowNumber, message: `Invalid rate: ${rateRaw}` });
        continue;
      }

      const key = `${canonicalProviderName.toLowerCase()}|${vehicleTypeKey}|${chargingTypeKey}`;
      if (seenKeys.has(key)) {
        errors.push({
          row: rowNumber,
          message: `Duplicate row for provider "${canonicalProviderName}", vehicle "${vehicleTypeRaw}", charging "${chargingTypeRaw}"`,
        });
        continue;
      }
      seenKeys.add(key);

      rows.push({
        providerName: canonicalProviderName,
        vehicleType: vehicleTypeRaw,
        chargingType: chargingTypeRaw,
        rate,
      });
    }

    return { rows: errors.length ? [] : rows, errors };
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];
      if (ch === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        values.push(current);
        current = '';
        continue;
      }
      current += ch;
    }
    values.push(current);
    return values;
  }

  get summaryText(): string {
    const accredited = this.providers.filter(p => p.status === 'Accredited').length;
    const inReview = this.providers.filter(p => p.status === 'In Review').length;
    const pending = this.providers.filter(p => p.status === 'Pending').length;
    return `${accredited} accredited • ${inReview} in review • ${pending} pending`;
  }

  getStatusClass(status: AccreditationStatus): string {
    const m: Record<AccreditationStatus, string> = {
      'Accredited': 'badge-accredited',
      'In Review': 'badge-in-review',
      'Pending': 'badge-pending',
      'Rejected': 'badge-rejected',
    };
    return m[status] || 'badge-pending';
  }

  getServiceAreasDisplay(areas: string[], maxVisible = 3): { visible: string[]; more: number } {
    if (areas.length <= maxVisible) return { visible: areas, more: 0 };
    return { visible: areas.slice(0, maxVisible), more: areas.length - maxVisible };
  }

  openDetail(provider: AccreditationProvider): void {
    this.dialog.open(ProviderDetailDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      height: '100%',
      maxHeight: '100vh',
      position: { right: '0', top: '0' },
      data: provider,
      panelClass: 'provider-detail-dialog-right',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '250ms',
    }).afterClosed().subscribe((result: { action?: string } | undefined) => {
      if (result?.action === 'edit') {
        this.openEditProvider(provider);
      }
    });
  }

  openAddProvider(): void {
    const draft = this.createEmptyAddProviderDraft();
    this.dialog.open(AddProviderDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: { draft },
    }).afterClosed().subscribe((result: AddProviderDraft | undefined) => {
      if (!result) return;
      if (this.keriApi.isConfigured()) {
        this.keriApi.createProvider(result).subscribe({
          next: () => this.reloadProvidersFromApi(),
          error: err => {
            const msg =
              err?.error?.error?.message || err?.error?.message || err?.message || 'Failed to create provider.';
            window.alert(typeof msg === 'string' ? msg : 'Failed to create provider.');
          },
        });
        return;
      }
      const newProvider = this.buildProviderFromDraft(result);
      this.providers = [...this.providers, newProvider];
      this.accreditationService.setProviders(this.providers);
    });
  }

  openEditProvider(provider: AccreditationProvider): void {
    const draft = this.providerToDraft(provider);
    this.dialog.open(AddProviderDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: { draft, mode: 'edit', providerId: provider.id },
    }).afterClosed().subscribe((result: AddProviderDraft | undefined) => {
      if (!result) return;
      const idx = this.providers.findIndex(p => p.id === provider.id);
      if (idx < 0) return;
      const existing = this.providers[idx];
      const updated = this.buildProviderFromDraft(result);
      this.providers[idx] = {
        ...updated,
        id: existing.id,
        documents: existing.documents,
        documentsVerified: existing.documentsVerified,
        documentsTotal: existing.documentsTotal,
        activeRiders: existing.activeRiders,
        accreditedOn: existing.accreditedOn,
        registeredOn: existing.registeredOn,
        apiTokenMasked: result.apiToken?.trim() ? (result.apiToken.slice(0, 8) + '........') : existing.apiTokenMasked,
      };
      this.providers = [...this.providers];
      this.accreditationService.setProviders(this.providers);
    });
  }

  private providerToDraft(provider: AccreditationProvider): AddProviderDraft {
    return {
      name: provider.name,
      registrationId: provider.registrationId,
      status: provider.status,
      capacity: provider.capacity,
      officeAddress: provider.officeAddress,
      garageAddress: provider.garageAddress,
      rateType: provider.rateType,
      serviceAreas: provider.serviceAreas ? [...provider.serviceAreas] : [],
      appUsage: provider.appUsage,
      contactPerson: provider.contactPerson,
      phone: provider.phone,
      email: provider.email,
      apiUrl: provider.apiUrl ?? '',
      apiToken: '',
      bank: provider.bank ? { ...provider.bank } : undefined,
    };
  }

  private createEmptyAddProviderDraft(): AddProviderDraft {
    return {
      name: '',
      registrationId: '',
      status: 'Pending',
      capacity: 0,
      officeAddress: '',
      garageAddress: '',
      rateType: 'Fixed Rate',
      serviceAreas: [],
      appUsage: 'Uses Provider Rider App',
      contactPerson: '',
      phone: '',
      email: '',
      apiUrl: '',
      apiToken: '',
    };
  }

  private buildProviderFromDraft(draft: AddProviderDraft): AccreditationProvider {
    const address = draft.officeAddress?.trim() || draft.garageAddress?.trim() || '—';
    const id = String(Date.now());
    const token = draft.apiToken?.trim();
    const apiTokenMasked = token ? (token.slice(0, 8) + '........') : undefined;
    return {
      id,
      name: draft.name.trim(),
      status: draft.status,
      registrationId: draft.registrationId.trim(),
      address,
      capacity: draft.capacity ?? 0,
      rateType: draft.rateType,
      serviceAreas: draft.serviceAreas?.length ? draft.serviceAreas : [],
      documentsVerified: 0,
      documentsTotal: 7,
      appUsage: draft.appUsage,
      officeAddress: draft.officeAddress?.trim() || '—',
      garageAddress: draft.garageAddress?.trim() || '—',
      contactPerson: draft.contactPerson.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      bank: draft.bank && draft.bank.bankName ? draft.bank : undefined,
      documents: AccreditationComponent.defaultDocuments(),
      activeRiders: 0,
      registeredOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      apiUrl: draft.apiUrl?.trim() || undefined,
      apiTokenMasked: apiTokenMasked || undefined,
    };
  }
}
