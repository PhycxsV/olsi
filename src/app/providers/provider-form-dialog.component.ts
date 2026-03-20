import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ProviderFormDraft {
  name: string;
  location: string;
  status: 'Active' | 'Paused';
  integrationType: 'provider_app' | 'aggregator_app' | 'third_party_app';
  activeRiders: number;
  totalRiders: number;
  avgTimeMin: number;
  acceptancePercent: number;
  slaPercent: number;
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
    { value: 'provider_app', label: 'Provider Rider App' },
    { value: 'aggregator_app', label: 'Aggregator Rider App' },
    { value: 'third_party_app', label: '3rd Party App' },
  ];

  constructor(
    private dialogRef: MatDialogRef<ProviderFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProviderFormDialogData,
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
    if (!this.draft.location.trim()) {
      window.alert('Service location is required.');
      return;
    }
    this.dialogRef.close(this.draft);
  }
}
