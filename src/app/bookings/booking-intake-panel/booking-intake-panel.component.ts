import { Component, Input } from '@angular/core';
import { ActiveRider, BookingIntakeResponse } from '../../core/models/booking-priority.model';

@Component({
  selector: 'app-booking-intake-panel',
  templateUrl: './booking-intake-panel.component.html',
  styleUrls: ['./booking-intake-panel.component.scss'],
})
export class BookingIntakePanelComponent {
  @Input() intake: BookingIntakeResponse | null = null;

  get availableRidersFromPreferred(): ActiveRider[] {
    return (this.intake?.activeRidersFromPreferred ?? []).filter(r => r.status === 'available');
  }
}
