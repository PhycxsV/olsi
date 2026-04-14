import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { AccreditationStatus, BankInfo } from '../../core/models/accreditation.model';
import { KeriProvidersApiService } from 'src/app/core/api/keri-providers-api.service';

export interface AddProviderDraft {
  name: string;
  documentId: string;
  registrationId: string;
  status: AccreditationStatus;
  capacity: number;
  officeAddress: string;
  garageAddress: string;
  rateType: string;
  serviceAreas: string[];
  appUsage: string;
  contactPerson: string;
  phone: string;
  email: string;
  apiUrl: string;
  apiToken: string;
  bank?: BankInfo;
}

export interface AddProviderDialogData {
  draft: AddProviderDraft;
  mode?: 'add' | 'edit';
  /** Set when mode is 'edit' so the parent can update the correct provider. */
  providerId?: string;
}

type AddProviderField =
  | 'name'
  | 'registrationId'
  | 'contactPerson'
  | 'phone'
  | 'email'
  | 'bankName'
  | 'bankAccountName'
  | 'bankAccountNumber';

@Component({
  selector: 'app-add-provider-dialog',
  templateUrl: './add-provider-dialog.component.html',
  styleUrls: ['./add-provider-dialog.component.scss'],
})
export class AddProviderDialogComponent {
  draft: AddProviderDraft;
  showBank = false;
  validationErrors: Partial<Record<AddProviderField, string>> = {};
  readonly isEditMode: boolean;
  readonly aggregatorAppUsageValue = 'Uses Aggregator Rider App';

  readonly rateTypeOptions = [
    { value: 'FIXED_RATE', label: 'Fixed Rate' },
    { value: 'CALCULATED_PER_DISTANCE', label: 'Calculated Per Distance' },
  ];
  readonly appUsageOptions = [
    { value: 'USES_PROVIDER_RIDER_APP', label: 'Uses Provider Rider App' },
    { value: 'USER_AGGREGATOR_RIDER_APP', label: 'Uses Aggregator Rider App' },
  ];

  constructor(
    private dialogRef: MatDialogRef<AddProviderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddProviderDialogData,
    private providerApi: KeriProvidersApiService
  ) {
    this.isEditMode = data.mode === 'edit';
    this.draft = {
      ...data.draft,
      serviceAreas: data.draft.serviceAreas ? [...data.draft.serviceAreas] : [],
    };
    if (this.draft.bank && (this.draft.bank.bankName || this.draft.bank.accountNumber)) {
      this.showBank = true;
    }
    this.onAppUsageChange();
  }

  get serviceAreasText(): string {
    return (this.draft.serviceAreas || []).join(', ');
  }
  set serviceAreasText(value: string) {
    this.draft.serviceAreas = value.split(',').map(s => s.trim()).filter(Boolean);
  }

  close(): void {
    this.dialogRef.close();
  }

  addBank(): void {
    this.showBank = true;
    if (!this.draft.bank) {
      this.draft.bank = { bankName: '', accountName: '', accountNumber: '', bankBranch: '' };
    }
  }

  removeBank(): void {
    this.showBank = false;
    this.draft.bank = undefined;
    delete this.validationErrors.bankName;
    delete this.validationErrors.bankAccountName;
    delete this.validationErrors.bankAccountNumber;
  }

  get isAggregatorMode(): boolean {
    return this.draft.appUsage === this.aggregatorAppUsageValue;
  }

  onAppUsageChange(): void {
    if (!this.isAggregatorMode) return;
    this.draft.apiUrl = '';
    this.draft.apiToken = '';
  }

  onFieldChange(field: AddProviderField): void {
    const message = this.validateField(field);
    if (message) {
      this.validationErrors[field] = message;
      return;
    }
    delete this.validationErrors[field];
  }

  getError(field: AddProviderField): string {
    return this.validationErrors[field] || '';
  }

  hasError(field: AddProviderField): boolean {
    return !!this.validationErrors[field];
  }

  save(): void {
    if (!this.validateForm()) return;
    if (this.isAggregatorMode) {
      this.draft.apiUrl = '';
      this.draft.apiToken = '';
    }
    this.dialogRef.close(this.draft);

    if (this.isEditMode == true) {

       let paylod = {company_name: this.draft.name, capacity: this.draft.capacity, registration_number: this.draft.registrationId,
        address: this.draft.officeAddress, garage_address: this.draft.garageAddress, rate_type: this.draft.rateType, app_usage: this.draft.appUsage,
        service_areas: this.draft.serviceAreas.toString(), contact_person: this.draft.contactPerson, contact_phone: this.draft.phone,
        contact_email: this.draft.email, api: this.draft.apiUrl, api_token: this.draft.apiToken, provider_status: this.draft.status
       }
      
      this.providerApi.updateProviderDetails(this.draft.documentId, {data: paylod})
      .subscribe((res: any)=>{
      })

    } else {
      
    }

  }

  private validateForm(): boolean {
    const fields: AddProviderField[] = [
      'name',
      'registrationId',
      'contactPerson',
      'phone',
      'email',
    ];
    if (this.showBank && this.draft.bank) {
      fields.push('bankName', 'bankAccountName', 'bankAccountNumber');
    }

    const nextErrors: Partial<Record<AddProviderField, string>> = {};
    for (const field of fields) {
      const message = this.validateField(field);
      if (message) {
        nextErrors[field] = message;
      }
    }
    this.validationErrors = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  private validateField(field: AddProviderField): string {
    switch (field) {
      case 'name':
        return this.draft.name.trim() ? '' : 'Company name is required.';
      case 'registrationId':
        return this.draft.registrationId.trim() ? '' : 'Registration number is required.';
      case 'contactPerson':
        return this.draft.contactPerson.trim() ? '' : 'Contact person is required.';
      case 'phone':
        if (!this.draft.phone.trim()) return 'Phone is required.';
        return this.isValidPhilippinePhone(this.draft.phone)
          ? ''
          : 'Enter a valid PH mobile number, like 09123456789 or +639123456789.';
      case 'email':
        if (!this.draft.email.trim()) return 'Email is required.';
        return this.isValidEmail(this.draft.email)
          ? ''
          : 'Enter a valid email address.';
      case 'bankName':
        return this.draft.bank?.bankName?.trim() ? '' : 'Bank name is required.';
      case 'bankAccountName':
        return this.draft.bank?.accountName?.trim() ? '' : 'Account name is required.';
      case 'bankAccountNumber':
        return this.draft.bank?.accountNumber?.trim() ? '' : 'Account number is required.';
      default:
        return '';
    }
  }

  private isValidPhilippinePhone(value: string): boolean {
    const digits = value.replace(/\D/g, '');
    return /^(09\d{9}|639\d{9})$/.test(digits);
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
}
