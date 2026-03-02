import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ChargingTypeId, CHARGING_TYPES, calculateCost } from '../../core/charging.model';
import { VEHICLE_TYPES } from '../../core/vehicle.model';

interface ClientOption {
  id: string;
  name: string;
  chargingTypeId: ChargingTypeId;
}

@Component({
  selector: 'app-create-booking-dialog',
  templateUrl: './create-booking-dialog.component.html',
  styleUrls: ['./create-booking-dialog.component.scss'],
})
export class CreateBookingDialogComponent {
  form: FormGroup;
  clientOptions: ClientOption[] = [
    { id: '1', name: 'FreshMart Philippines', chargingTypeId: 'per_distance' },
    { id: '2', name: 'QuickEats Delivery', chargingTypeId: 'fixed_rate' },
    { id: '4', name: 'TechStore PH', chargingTypeId: 'ad_valorem' },
    { id: '6', name: 'GreenGrocers Co.', chargingTypeId: 'per_distance' },
  ];
  vehicleTypes = VEHICLE_TYPES;
  chargingTypes = CHARGING_TYPES.filter(c => c.phase === 1);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateBookingDialogComponent>
  ) {
    this.form = this.fb.group({
      clientId: ['', Validators.required],
      vehicleTypeId: ['', Validators.required],
      pickupAddress: ['', Validators.required],
      pickupLat: [null as number | null],
      pickupLon: [null as number | null],
      dropoffAddress: ['', Validators.required],
      dropoffLat: [null as number | null],
      dropoffLon: [null as number | null],
      chargingTypeId: ['per_distance'], // from client, can override if needed
      distanceKm: [5],
      salesInvoiceValue: [null as number | null],
      isWalkin: [false],
    });
  }

  get selectedClient(): ClientOption | undefined {
    const id = this.form.get('clientId')?.value;
    return this.clientOptions.find(c => c.id === id);
  }

  get selectedChargingTypeId(): ChargingTypeId {
    return this.form.get('chargingTypeId')?.value ?? 'per_distance';
  }

  get calculatedCost(): number | null {
    const typeId = this.selectedChargingTypeId;
    if (this.form.get('isWalkin')?.value) return null; // Walk-in: fixed charging, TBD
    if (typeId === 'per_distance') {
      const km = this.form.get('distanceKm')?.value;
      return calculateCost('per_distance', { distanceKm: km != null ? Number(km) : undefined });
    }
    if (typeId === 'ad_valorem') {
      const si = this.form.get('salesInvoiceValue')?.value;
      return calculateCost('ad_valorem', { salesInvoiceValue: si != null ? Number(si) : undefined });
    }
    return null;
  }

  get costDisplay(): string {
    const c = this.calculatedCost;
    if (c == null) return this.form.get('isWalkin')?.value ? 'Fixed (manual)' : '—';
    return `₱${Math.round(c).toLocaleString()}`;
  }

  onClientChange(): void {
    const client = this.selectedClient;
    if (client) this.form.patchValue({ chargingTypeId: client.chargingTypeId });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    console.log('Create booking (mock)', value);
    this.dialogRef.close(value);
  }
}
