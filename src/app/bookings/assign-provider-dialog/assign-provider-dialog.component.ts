import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AssignProviderOption {
  id: string;
  name: string;
  initial: string;
  serviceArea: string;
  capacityCurrent: number;
  capacityTotal: number;
  slaPercent: number;
}

export interface AssignProviderDialogData {
  bookingId: string;
  providers: AssignProviderOption[];
  selectedProviderId?: string | null;
}

@Component({
  selector: 'app-assign-provider-dialog',
  templateUrl: './assign-provider-dialog.component.html',
  styleUrls: ['./assign-provider-dialog.component.scss'],
})
export class AssignProviderDialogComponent {
  selectedProviderId: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<AssignProviderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignProviderDialogData,
  ) {
    this.selectedProviderId = data.selectedProviderId ?? null;
  }

  close(): void {
    this.dialogRef.close();
  }

  selectProvider(provider: AssignProviderOption): void {
    this.selectedProviderId = this.selectedProviderId === provider.id ? null : provider.id;
  }

  isSelected(provider: AssignProviderOption): boolean {
    return this.selectedProviderId === provider.id;
  }

  assign(): void {
    if (!this.selectedProviderId) return;
    const provider = this.data.providers.find(p => p.id === this.selectedProviderId);
    this.dialogRef.close(provider ?? null);
  }
}
