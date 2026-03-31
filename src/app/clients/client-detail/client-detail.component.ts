import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChargingTypeId, CHARGING_TYPES } from '../../core/charging.model';
import { VEHICLE_TYPES } from '../../core/vehicle.model';
import { ClientRow, ClientStatus, PreferredProviderRef } from '../clients.component';
import { ClientService } from '../client.service';
import { PreferredProviderDialogComponent, PreferredProviderDialogSelection } from '../preferred-provider-dialog.component';
import { ProviderService } from '../../providers/provider.service';

export interface ClientBookingRow {
  orderNo: string;
  date: string;
  status: string;
  destination: string;
  amount: string;
}

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
})
export class ClientDetailComponent implements OnInit {
  private readonly maxPreferredProviders = 2;
  client: ClientRow | null = null;
  private clientRouteId: string | null = null;
  activeTabIndex = 0;

  /** Mock: client's bookings */
  clientBookings: ClientBookingRow[] = [
    { orderNo: 'ORD-501', date: '2025-02-22 09:00', status: 'Completed', destination: 'Manila', amount: '₱ 150' },
    { orderNo: 'ORD-502', date: '2025-02-21 14:30', status: 'Completed', destination: 'Quezon City', amount: '₱ 280' },
    { orderNo: 'ORD-503', date: '2025-02-20 11:00', status: 'Cancelled', destination: 'Makati', amount: '—' },
  ];

  /** Mock: transactions */
  transactions: { id: string; date: string; type: string; amount: string }[] = [
    { id: 'TXN-001', date: 'Feb 22, 2025', type: 'Booking', amount: '₱ 150' },
    { id: 'TXN-002', date: 'Feb 21, 2025', type: 'Booking', amount: '₱ 280' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private providerService: ProviderService,
    private dialog: MatDialog,
  ) {}

  get preferredProvidersList(): PreferredProviderRef[] {
    return this.client?.preferredProviders ?? [];
  }

  get canAddMorePreferredProviders(): boolean {
    if (!this.client) return false;
    const currentCount = (this.client.preferredProviders ?? []).length;
    if (currentCount >= this.maxPreferredProviders) return false;
    const taken = new Set((this.client.preferredProviders ?? []).map(p => p.id));
    return this.providerService.getProviders().some(p => !taken.has(p.id));
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.clientRouteId = id;
    if (id) {
      this.client = this.clientService.getClientById(id) ?? null;
    }
  }

  openPreferredProviderDialog(): void {
    if (!this.client?.id) return;
    const excludeProviderIds = (this.client.preferredProviders ?? []).map(p => p.id);
    this.dialog
      .open(PreferredProviderDialogComponent, {
        width: '400px',
        maxWidth: '95vw',
        data: { excludeProviderIds },
      })
      .afterClosed()
      .subscribe((result: { selections: PreferredProviderDialogSelection[] } | undefined) => {
        if (!result || !this.clientRouteId) return;
        const current = this.clientService.getClientById(this.clientRouteId);
        if (!current) return;
        const existing = [...(current.preferredProviders ?? [])];
        const existingIds = new Set(existing.map(provider => provider.id));
        result.selections.forEach(selection => {
          if (existing.length >= this.maxPreferredProviders) return;
          if (existingIds.has(selection.providerId)) return;
          existing.push({ id: selection.providerId, name: selection.providerName });
          existingIds.add(selection.providerId);
        });
        if (existing.length === (current.preferredProviders ?? []).length) return;
        this.clientService.updateClient(this.clientRouteId, { preferredProviders: existing });
        this.client = this.clientService.getClientById(this.clientRouteId) ?? null;
      });
  }

  removePreferredProvider(providerId: string): void {
    if (!this.clientRouteId) return;
    const current = this.clientService.getClientById(this.clientRouteId);
    if (!current) return;
    const next = (current.preferredProviders ?? []).filter(p => p.id !== providerId);
    this.clientService.updateClient(this.clientRouteId, { preferredProviders: next });
    this.client = this.clientService.getClientById(this.clientRouteId) ?? null;
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
