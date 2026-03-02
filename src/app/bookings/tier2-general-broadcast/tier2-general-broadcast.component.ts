import { Component, Input } from '@angular/core';
import { Tier2Payload } from '../../core/models/booking-priority.model';
import { BookingPriorityService } from '../../core/services/booking-priority.service';

@Component({
  selector: 'app-tier2-general-broadcast',
  templateUrl: './tier2-general-broadcast.component.html',
  styleUrls: ['./tier2-general-broadcast.component.scss'],
})
export class Tier2GeneralBroadcastComponent {
  @Input() tier2: Tier2Payload | null = null;

  constructor(public priority: BookingPriorityService) {}

  assignSupplier(supplierId: string, supplierName: string): void {
    this.priority.assignFromTier2(supplierId, supplierName);
  }
}
