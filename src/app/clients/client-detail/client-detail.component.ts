import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChargingTypeId, CHARGING_TYPES } from '../../core/charging.model';
import { VEHICLE_TYPES } from '../../core/vehicle.model';
import { ClientRow, ClientStatus } from '../clients.component';
import { ClientService, ClientSupplierRider } from '../client.service';

export interface ClientBookingRow {
  orderNo: string;
  date: string;
  status: string;
  destination: string;
  amount: string;
}

export interface SupplierRiderGroup {
  supplierName: string;
  riderCount: number;
}

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
})
export class ClientDetailComponent implements OnInit {
  client: ClientRow | null = null;
  activeTabIndex = 0;

  /** Mock: client's bookings */
  clientBookings: ClientBookingRow[] = [
    { orderNo: 'ORD-501', date: '2025-02-22 09:00', status: 'Completed', destination: 'Manila', amount: '₱ 150' },
    { orderNo: 'ORD-502', date: '2025-02-21 14:30', status: 'Completed', destination: 'Quezon City', amount: '₱ 280' },
    { orderNo: 'ORD-503', date: '2025-02-20 11:00', status: 'Cancelled', destination: 'Makati', amount: '—' },
  ];

  /** Per-client designated supplier riders */
  whitelistedRiders: ClientSupplierRider[] = [];

  /** Mock: transactions */
  transactions: { id: string; date: string; type: string; amount: string }[] = [
    { id: 'TXN-001', date: 'Feb 22, 2025', type: 'Booking', amount: '₱ 150' },
    { id: 'TXN-002', date: 'Feb 21, 2025', type: 'Booking', amount: '₱ 280' },
  ];

  /** Mock: topups */
  topups: { id: string; date: string; amount: string; status: string }[] = [
    { id: 'TOP-001', date: 'Feb 01, 2025', amount: '₱ 5,000', status: 'Credited' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.client = this.clientService.getClientById(id) ?? null;
      this.whitelistedRiders = this.clientService.getSupplierRidersByClientId(id);
    }
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }

  getStatusClass(status: ClientStatus | string): string {
    const map: Record<string, string> = {
      Active: 'badge-active',
      Inactive: 'badge-inactive',
      Suspended: 'badge-suspended',
      Completed: 'badge-completed',
      Cancelled: 'badge-cancelled',
    };
    return map[status] || 'badge-pending';
  }

  getVehicleLabel(vehicleTypeId: string): string {
    return VEHICLE_TYPES.find(v => v.id === vehicleTypeId)?.label ?? vehicleTypeId;
  }

  getChargingLabel(id: ChargingTypeId): string {
    return CHARGING_TYPES.find(c => c.id === id)?.label ?? id;
  }

  getPrimaryVehicleLabel(): string {
    if (!this.client?.vehicleCharging?.length) return '—';
    return this.getVehicleLabel(this.client.vehicleCharging[0].vehicleTypeId);
  }

  getPrimaryChargingLabel(): string {
    if (!this.client?.vehicleCharging?.length) return '—';
    return this.getChargingLabel(this.client.vehicleCharging[0].chargingTypeId);
  }

  get uniqueSupplierCount(): number {
    return this.supplierRiderGroups.length;
  }

  get supplierRiderGroups(): SupplierRiderGroup[] {
    const grouped = new Map<string, number>();
    for (const row of this.whitelistedRiders) {
      grouped.set(row.supplierName, (grouped.get(row.supplierName) ?? 0) + 1);
    }
    return [...grouped.entries()]
      .map(([supplierName, riderCount]) => ({ supplierName, riderCount }))
      .sort((a, b) => b.riderCount - a.riderCount || a.supplierName.localeCompare(b.supplierName));
  }

  /** Display-only: show prefix + dots (e.g. sk_live_.........) so the full key is never shown. */
  getApiKeyDisplay(maskedKey: string): string {
    if (!maskedKey || maskedKey.length < 8) return '.........';
    if (maskedKey.startsWith('sk_live_')) return 'sk_live_.........';
    if (maskedKey.startsWith('sk_')) return 'sk_.........';
    return '.........';
  }

  copyText(value: string): void {
    navigator.clipboard.writeText(value);
  }

  openExternalUrl(url: string): void {
    window.open(url, '_blank', 'noopener');
  }
}
