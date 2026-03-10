import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { ChargingTypeId, ChargingType } from '../core/charging.model';
import type { VehicleType } from '../core/vehicle.model';
import type { ClientStatus, ClientVehicleCharging } from './clients.component';

export interface ClientDraft {
  clientId: string;
  name: string;
  status: ClientStatus;
  businessAddress: string;
  paymentTermsDays: number;
  apiKeyMasked: string;
  webhookUrl: string;
  registeredOn: string;
  vehicleCharging: ClientVehicleCharging[];
}

export interface ClientFormDialogData {
  mode: 'create' | 'edit';
  draft: ClientDraft;
  statusOptions: { value: ClientStatus; label: string }[];
  vehicleTypes: VehicleType[];
  chargingTypes: ChargingType[];
}

@Component({
  selector: 'app-client-form-dialog',
  templateUrl: './client-form-dialog.component.html',
  styleUrls: ['./client-form-dialog.component.scss'],
})
export class ClientFormDialogComponent {
  draft: ClientDraft;

  constructor(
    private dialogRef: MatDialogRef<ClientFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientFormDialogData,
  ) {
    this.draft = {
      ...data.draft,
      vehicleCharging: data.draft.vehicleCharging.map(v => ({ ...v })),
    };
  }

  addVehicleCharging(): void {
    this.draft.vehicleCharging.push({
      vehicleTypeId: this.data.vehicleTypes[0]?.id ?? 'motorcycle',
      chargingTypeId: (this.data.chargingTypes[0]?.id ?? 'per_distance') as ChargingTypeId,
    });
  }

  removeVehicleCharging(index: number): void {
    if (this.draft.vehicleCharging.length <= 1) return;
    this.draft.vehicleCharging.splice(index, 1);
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (!this.draft.clientId.trim()) {
      window.alert('Client ID is required.');
      return;
    }
    if (!this.draft.name.trim()) {
      window.alert('Client name is required.');
      return;
    }
    if (this.draft.vehicleCharging.length === 0) {
      window.alert('Add at least one vehicle charging setup.');
      return;
    }
    const hasIncompleteRow = this.draft.vehicleCharging.some(v => !v.vehicleTypeId || !v.chargingTypeId);
    if (hasIncompleteRow) {
      window.alert('Complete all vehicle charging rows.');
      return;
    }
    this.dialogRef.close(this.draft);
  }
}
