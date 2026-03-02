import { Component, OnDestroy, OnInit } from '@angular/core';
import { BookingPriorityService } from '../../core/services/booking-priority.service';
import { Tier1Payload } from '../../core/models/booking-priority.model';

@Component({
  selector: 'app-tier1-priority-push',
  templateUrl: './tier1-priority-push.component.html',
  styleUrls: ['./tier1-priority-push.component.scss'],
})
export class Tier1PriorityPushComponent implements OnInit, OnDestroy {
  tier1: Tier1Payload | null = null;
  countdownSeconds = 0;
  supplierResponses: { riderId: string; riderName: string; response: string; at: string }[] = [];
  private subs: { unsubscribe: () => void }[] = [];

  constructor(public priority: BookingPriorityService) {}

  ngOnInit(): void {
    this.subs.push(this.priority.getTier1().subscribe(t => (this.tier1 = t)));
    this.subs.push(this.priority.getCountdownSeconds().subscribe(s => (this.countdownSeconds = s)));
    this.subs.push(this.priority.getSupplierResponses().subscribe(r => (this.supplierResponses = r)));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  formatCountdown(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  simulateAccept(): void {
    const t = this.tier1;
    if (!t) return;
    const riderId = t.notifiedRiderIds[0] || 'r1';
    this.priority.acceptTier1(riderId, 'Juan D.');
  }

  simulateDecline(): void {
    const t = this.tier1;
    if (!t) return;
    const riderId = t.notifiedRiderIds[0] || 'r1';
    this.priority.declineTier1(riderId, 'Juan D.');
  }

  triggerTier2(): void {
    this.priority.triggerTier2();
  }

  getResponseClass(response: string): string {
    if (response === 'accept') return 'accept';
    if (response === 'decline') return 'decline';
    if (response === 'timeout') return 'timeout';
    return 'pending';
  }
}
