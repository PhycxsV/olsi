import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type AccreditationStatus = 'Accredited' | 'In Review' | 'Pending' | 'Rejected';

export interface AddProviderDraft {
  name: string;
  status: AccreditationStatus;
  registrationId: string;
  address: string;
  capacity: number;
  rateType: string;
  serviceAreas: string;
  appUsage: string;
  contactPerson: string;
  phone: string;
  email: string;
  apiUrl: string;
  apiTokenMasked: string;
}

@Component({
  selector: 'app-add-provider-dialog',
  templateUrl: './add-provider-dialog.component.html',
  styleUrls: ['./add-provider-dialog.component.scss'],
})
export class AddProviderDialogComponent {
  draft: AddProviderDraft;

  constructor(
    private dialogRef: MatDialogRef<AddProviderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { draft: AddProviderDraft },
  ) {
    this.draft = { ...data.draft };
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (!this.draft.name.trim()) {
      window.alert('Provider name is required.');
      return;
    }
    if (!this.draft.registrationId.trim()) {
      window.alert('Registration ID is required.');
      return;
    }
    if (!this.draft.address.trim()) {
      window.alert('Address is required.');
      return;
    }
    this.dialogRef.close(this.draft);
  }
}
