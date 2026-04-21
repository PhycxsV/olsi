import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ProviderFormDraft {
  name: string;
  documentId: string,
  location: string;
  status: 'Active' | 'Paused';
  integrationType: 'USES_PROVIDER_RIDER_APP' | 'USER_AGGREGATOR_RIDER_APP' | 'THIRD_PARTY_APP';
  activeRiders: number;
  totalRiders: number;
  avgTimeMin: number;
  acceptancePercent: number;
  slaPercent: number;
  is_active: boolean
}

export interface ProviderFormDialogData {
  mode: 'create' | 'edit';
  draft: ProviderFormDraft;
}

@Component({
  selector: 'app-provider-form-dialog',
  templateUrl: './provider-form-dialog.component.html',
  styleUrls: ['./provider-form-dialog.component.scss'],
})
export class ProviderFormDialogComponent {
  draft: ProviderFormDraft;
  readonly integrationTypeOptions: Array<{ value: ProviderFormDraft['integrationType']; label: string }> = [
    { value: 'USES_PROVIDER_RIDER_APP', label: 'Provider Rider App' },
    { value: 'USER_AGGREGATOR_RIDER_APP', label: 'Aggregator Rider App' },
    { value: 'THIRD_PARTY_APP', label: '3rd Party App' },
  ];

  constructor(
    private dialogRef: MatDialogRef<ProviderFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProviderFormDialogData,
  ) {
    this.draft = {
      ...data.draft,
      status: data.draft.is_active ? 'Active' : 'Paused',
      is_active: !!data.draft.is_active,
    };
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (!this.draft.name.trim()) {
      window.alert('Provider name is required.');
      return;
    }
    if (!this.draft.location.trim()) {
      window.alert('Service location is required.');
      return;
    }

    this.draft.is_active = this.draft.status === 'Active';

    this.dialogRef.close(this.draft);
  }
}
