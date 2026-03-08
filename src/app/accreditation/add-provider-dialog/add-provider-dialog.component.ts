import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { AccreditationStatus } from '../accreditation.component';
import type { BankInfo } from '../accreditation.component';

export interface AddProviderDraft {
  name: string;
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
}

@Component({
  selector: 'app-add-provider-dialog',
  templateUrl: './add-provider-dialog.component.html',
  styleUrls: ['./add-provider-dialog.component.scss'],
})
export class AddProviderDialogComponent {
  draft: AddProviderDraft;
  showBank = false;

  readonly rateTypeOptions = [
    { value: 'Fixed Rate', label: 'Fixed Rate' },
    { value: 'Calculated Per Distance', label: 'Calculated Per Distance' },
  ];
  readonly appUsageOptions = [
    { value: 'Uses Provider Rider App', label: 'Uses Provider Rider App' },
    { value: 'Uses Aggregator Rider App', label: 'Uses Aggregator Rider App' },
  ];

  constructor(
    private dialogRef: MatDialogRef<AddProviderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddProviderDialogData,
  ) {
    this.draft = {
      ...data.draft,
      serviceAreas: data.draft.serviceAreas ? [...data.draft.serviceAreas] : [],
    };
    if (this.draft.bank && (this.draft.bank.bankName || this.draft.bank.accountNumber)) {
      this.showBank = true;
    }
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
  }

  save(): void {
    if (!this.draft.name.trim()) {
      window.alert('Company name is required.');
      return;
    }
    if (!this.draft.registrationId.trim()) {
      window.alert('Registration number is required.');
      return;
    }
    if (!this.draft.contactPerson.trim()) {
      window.alert('Contact person is required.');
      return;
    }
    if (!this.draft.phone.trim()) {
      window.alert('Phone is required.');
      return;
    }
    if (!this.draft.email.trim()) {
      window.alert('Email is required.');
      return;
    }
    if (this.showBank && this.draft.bank) {
      if (!this.draft.bank.bankName?.trim() || !this.draft.bank.accountName?.trim() || !this.draft.bank.accountNumber?.trim()) {
        window.alert('Please complete bank name, account name, and account number, or remove bank details.');
        return;
      }
    }
    this.dialogRef.close(this.draft);
  }
}
