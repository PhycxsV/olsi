import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KeriProvidersApiService } from '../core/api/keri-providers-api.service';

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
    private providerApi: KeriProvidersApiService
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

    let payload = {company_name: this.draft.name, service_areas: this.draft.location, is_active: this.draft.status,
      app_usage: this.draft.integrationType, sla_percent: this.draft.slaPercent, total_riders: this.draft.totalRiders
    }

    this.providerApi.updateProviderDetails(this.draft.documentId, {data: payload})
    .subscribe((res: any)=>{
       debugger
    })

    this.dialogRef.close(this.draft);
  }
}
