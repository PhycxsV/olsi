import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProviderDetailDialogComponent } from './provider-detail-dialog/provider-detail-dialog.component';
import { AddProviderDialogComponent, AddProviderDraft } from './add-provider-dialog/add-provider-dialog.component';
import { AccreditationService } from '../core/services/accreditation.service';

export type AccreditationStatus = 'Accredited' | 'In Review' | 'Pending' | 'Rejected';

export interface ProviderDocument {
  title: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'Verified' | 'Pending';
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
  /** Vehicle types this provider can cater (filters bookings) */
  vehicleTypeIds?: string[];
}

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
  searchText = '';
  statusFilter: AccreditationStatus | '' = '';

  statusCards: StatusCardItem[] = [
    { label: 'Total', value: 6, type: 'total' },
    { label: 'Accredited', value: 3, type: 'accredited' },
    { label: 'In Review', value: 1, type: 'in_review' },
    { label: 'Pending', value: 1, type: 'pending' },
    { label: 'Rejected', value: 1, type: 'rejected' },
  ];

  /** Returns all documents in Pending state (verification done via View modal). */
  private static defaultDocuments(): ProviderDocument[] {
    const titles = ['SEC / DTI Registration', "Mayor's Permit", 'BIR Registration', 'Service Invoice / Billing Statement', 'Sales Invoice', 'Sketch / Map of Office and Garage', 'Marine Insurance'];
    const filenames = ['sec-dti-registration.pdf', 'mayors-permit.pdf', 'bir-registration.pdf', 'service-invoice.pdf', 'sales-invoice.pdf', 'office-garage-sketch.pdf', 'marine-insurance.pdf'];
    return titles.map((title, i) => ({
      title,
      filename: filenames[i],
      uploadedAt: 'Jan 10, 2024',
      uploadedBy: 'Admin',
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
  ) {}

  ngOnInit(): void {
    if (this.accreditationService.getProviders().length === 0) {
      this.accreditationService.setProviders(this.providers);
    }
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
      const newProvider = this.buildProviderFromDraft(result);
      this.providers = [...this.providers, newProvider];
      this.accreditationService.setProviders(this.providers);
    });
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
