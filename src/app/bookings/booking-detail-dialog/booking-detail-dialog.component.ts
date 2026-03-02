import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface BookingEligibleProvider {
  id: string;
  name: string;
  initial: string;
  riders: number;
  slaPercent: number;
  isAssigned: boolean;
}

export interface BookingAssignmentEvent {
  event: string;
  time: string;
  dotColor: 'green' | 'yellow' | 'blue';
}

export interface BookingDetailData {
  id: string;
  status: string;
  clientName: string;
  clientSource: string;
  pickupAddress: string;
  pickupTime: string;
  dropoffAddress: string;
  dropoffTime: string;
  packageType: string;
  slaMinutes: number;
  amount: string;
  createdTime: string;
  eligibleProviders: BookingEligibleProvider[];
  assignmentHistory: BookingAssignmentEvent[];
}

@Component({
  selector: 'app-booking-detail-dialog',
  templateUrl: './booking-detail-dialog.component.html',
  styleUrls: ['./booking-detail-dialog.component.scss'],
})
export class BookingDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BookingDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public booking: BookingDetailData,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  onReassign(): void {
    this.dialogRef.close('reassign');
  }

  onCancelBooking(): void {
    this.dialogRef.close('cancel');
  }

  onAssignProvider(provider: BookingEligibleProvider): void {
    if (provider.isAssigned) return;
    this.dialogRef.close({ action: 'assign', provider });
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('assigned') || s.includes('active')) return 'badge-assigned';
    if (s.includes('pending')) return 'badge-pending';
    if (s.includes('completed')) return 'badge-completed';
    if (s.includes('cancelled')) return 'badge-cancelled';
    return 'badge-pending';
  }
}
