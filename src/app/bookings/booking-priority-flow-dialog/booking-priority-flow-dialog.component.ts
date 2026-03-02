import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingPriorityService } from '../../core/services/booking-priority.service';
import {
  BookingIntakeResponse,
  BookingPriorityState,
  Tier1Payload,
  Tier2Payload,
} from '../../core/models/booking-priority.model';

export interface BookingPriorityFlowDialogData {
  /** Account ID (e.g. clientId from create booking). */
  accountId: string;
  /** Optional: pre-filled Tier 1 window minutes (3–5). */
  tier1WindowMinutes?: number;
}

@Component({
  selector: 'app-booking-priority-flow-dialog',
  templateUrl: './booking-priority-flow-dialog.component.html',
  styleUrls: ['./booking-priority-flow-dialog.component.scss'],
})
export class BookingPriorityFlowDialogComponent implements OnInit, OnDestroy {
  intake: BookingIntakeResponse | null = null;
  state: BookingPriorityState | null = null;
  tier1: Tier1Payload | null = null;
  tier2: Tier2Payload | null = null;
  tier1WindowMinutes = 4;

  constructor(
    private dialogRef: MatDialogRef<BookingPriorityFlowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingPriorityFlowDialogData,
    private priority: BookingPriorityService,
  ) {}

  ngOnInit(): void {
    this.tier1WindowMinutes = this.data.tier1WindowMinutes ?? this.priority.getTier1WindowMinutes();
    this.priority.setTier1WindowMinutes(this.tier1WindowMinutes);

    this.priority.getIntake().subscribe(i => (this.intake = i));
    this.priority.getState().subscribe(s => (this.state = s));
    this.priority.getTier1().subscribe(t => (this.tier1 = t));
    this.priority.getTier2().subscribe(t => (this.tier2 = t));

    if (this.data.accountId) {
      this.priority.submitBookingIntake(this.data.accountId).subscribe();
    }
  }

  ngOnDestroy(): void {
    this.priority.reset();
  }

  get progressStep(): 1 | 2 | 3 {
    if (this.state === 'ASSIGNED' || this.state === 'ASSIGNED_BROADCAST') return 3;
    if (this.state === 'BROADCAST' || this.state === 'TIMEOUT' || this.tier2) return 2;
    return 1;
  }

  close(): void {
    this.priority.reset();
    this.dialogRef.close();
  }
}
