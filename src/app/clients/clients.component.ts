import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChargingTypeId, CHARGING_TYPES } from '../core/charging.model';
import { VEHICLE_TYPES } from '../core/vehicle.model';
import { ClientDraft as ClientFormDraft, ClientFormDialogComponent } from './client-form-dialog.component';
import { ClientService } from './client.service';

export type ClientStatus = 'Active' | 'Inactive' | 'Suspended';

export interface ClientRow {
  id: string;
  clientId: string;
  name: string;
  status: ClientStatus;
  /** Charging type from Charging DB – how OLSI charges this client */
  vehicleCharging: ClientVehicleCharging[];
  /** Payment terms in days (integer) */
  paymentTermsDays: number;
  totalBookings: number;
  lastBookingAt: string;
  apiKeyMasked: string;
  businessAddress: string;
  webhookUrl: string;
  registeredOn: string;
  /** Preferred provider for priority push routing */
  preferredProviderId?: string;
  preferredProviderName?: string;
}

export interface ClientVehicleCharging {
  vehicleTypeId: string;
  chargingTypeId: ChargingTypeId;
}

export interface StatusCard {
  label: string;
  value: number;
  type: 'total' | 'active' | 'inactive' | 'suspended';
}

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
})
export class ClientsComponent {
  searchText = '';
  statusFilter: ClientStatus | '' = '';

  vehicleTypes = VEHICLE_TYPES;
  chargingTypes = CHARGING_TYPES.filter(c => c.phase === 1);

  statusFilterOptions: { value: '' | ClientStatus; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Suspended', label: 'Suspended' },
  ];

  displayedColumns = ['name', 'status', 'vehicle', 'charging', 'paymentTerms', 'totalBookings', 'apiKey', 'actions'];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private clientService: ClientService,
  ) {}

  get clients(): ClientRow[] {
    return this.clientService.getClients();
  }

  get filteredClients(): ClientRow[] {
    let list = [...this.clients];
    if (this.statusFilter) {
      list = list.filter(c => c.status === this.statusFilter);
    }
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.clientId.toLowerCase().includes(q)
      );
    }
    return list;
  }

  get summaryText(): string {
    const active = this.clients.filter(c => c.status === 'Active').length;
    const totalBookings = this.clients.reduce((sum, c) => sum + c.totalBookings, 0);
    return `${active} active clients • ${totalBookings.toLocaleString()} total bookings`;
  }

  get statusCards(): StatusCard[] {
    const total = this.clients.length;
    const active = this.clients.filter(c => c.status === 'Active').length;
    const inactive = this.clients.filter(c => c.status === 'Inactive').length;
    const suspended = this.clients.filter(c => c.status === 'Suspended').length;
    return [
      { label: 'Total Clients', value: total, type: 'total' },
      { label: 'Active', value: active, type: 'active' },
      { label: 'Inactive', value: inactive, type: 'inactive' },
      { label: 'Suspended', value: suspended, type: 'suspended' },
    ];
  }

  getStatusClass(status: ClientStatus): string {
    const map: Record<ClientStatus, string> = {
      Active: 'badge-active',
      Inactive: 'badge-inactive',
      Suspended: 'badge-suspended',
    };
    return map[status] || 'badge-inactive';
  }

  /** Display-only: show prefix + dots (e.g. sk_live_.........) so the full key is never shown. */
  getApiKeyDisplay(maskedKey: string): string {
    if (!maskedKey || maskedKey.length < 8) return '.........';
    if (maskedKey.startsWith('sk_live_')) return 'sk_live_.........';
    if (maskedKey.startsWith('sk_')) return 'sk_.........';
    return '.........';
  }

  copyApiKey(client: ClientRow): void {
    navigator.clipboard.writeText(client.apiKeyMasked);
    // Could show a snackbar/toast here
  }

  copyText(value: string): void {
    navigator.clipboard.writeText(value);
  }

  openExternalUrl(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  onAddClient(): void {
    const draft = this.createEmptyDraft();
    this.openClientFormDialog('create', draft);
  }

  /** Label for charging type (from Charging DB) */
  getChargingLabel(id: ChargingTypeId): string {
    return CHARGING_TYPES.find(c => c.id === id)?.label ?? id;
  }

  onClientAction(client: ClientRow, action: string): void {
    if (action === 'Edit') {
      this.openClientFormDialog('edit', this.createDraftFromClient(client), client.id);
      return;
    }
    if (action === 'View details') {
      this.router.navigate(['/clients', client.id]);
      return;
    }
    if (action === 'Suspend' && client.status === 'Active') {
      client.status = 'Suspended';
    }
  }

  getVehicleLabel(vehicleTypeId: string): string {
    return this.vehicleTypes.find(v => v.id === vehicleTypeId)?.label ?? vehicleTypeId;
  }

  getPrimaryVehicleLabel(client: ClientRow): string {
    const first = client.vehicleCharging[0];
    if (!first) return '—';
    return this.getVehicleLabel(first.vehicleTypeId);
  }

  getPrimaryChargingLabel(client: ClientRow): string {
    const first = client.vehicleCharging[0];
    if (!first) return '—';
    return this.getChargingLabel(first.chargingTypeId);
  }

  private openClientFormDialog(mode: 'create' | 'edit', draft: ClientFormDraft, targetClientId?: string): void {
    this.dialog.open(ClientFormDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: {
        mode,
        draft,
        statusOptions: this.statusFilterOptions.slice(1) as { value: ClientStatus; label: string }[],
        vehicleTypes: this.vehicleTypes,
        chargingTypes: this.chargingTypes,
      },
    }).afterClosed().subscribe((result: ClientFormDraft | undefined) => {
      if (!result) return;
      if (mode === 'create') {
        this.clientService.addClient({
          id: Date.now().toString(),
          clientId: result.clientId,
          name: result.name.trim(),
          status: result.status,
          businessAddress: result.businessAddress.trim() || '—',
          vehicleCharging: result.vehicleCharging.map(v => ({ ...v })),
          paymentTermsDays: result.paymentTermsDays,
          totalBookings: 0,
          lastBookingAt: '—',
          apiKeyMasked: result.apiKeyMasked.trim() || 'sk_live_********',
          webhookUrl: result.webhookUrl.trim() || '—',
          registeredOn: result.registeredOn.trim() || '—',
        });
        return;
      }
      if (!targetClientId) return;
      this.clientService.updateClient(targetClientId, {
        clientId: result.clientId,
        name: result.name.trim(),
        status: result.status,
        businessAddress: result.businessAddress.trim(),
        vehicleCharging: result.vehicleCharging.map(v => ({ ...v })),
        paymentTermsDays: result.paymentTermsDays,
        apiKeyMasked: result.apiKeyMasked.trim(),
        webhookUrl: result.webhookUrl.trim(),
        registeredOn: result.registeredOn.trim(),
      });
    });
  }

  private createDraftFromClient(client: ClientRow): ClientFormDraft {
    return {
      clientId: client.clientId,
      name: client.name,
      status: client.status,
      businessAddress: client.businessAddress,
      paymentTermsDays: client.paymentTermsDays,
      apiKeyMasked: client.apiKeyMasked,
      webhookUrl: client.webhookUrl,
      registeredOn: client.registeredOn,
      vehicleCharging: client.vehicleCharging.map(v => ({ ...v })),
    };
  }

  private createEmptyDraft(): ClientFormDraft {
    return {
      clientId: '',
      name: '',
      status: 'Active',
      businessAddress: '',
      paymentTermsDays: 30,
      apiKeyMasked: 'sk_live_********',
      webhookUrl: '',
      registeredOn: '',
      vehicleCharging: [{ vehicleTypeId: 'motorcycle', chargingTypeId: 'per_distance' }],
    };
  }

  private getNextClientCode(): string {
    const maxNumber = this.clients.reduce((max, client) => {
      const n = Number(client.clientId.replace('CL-', ''));
      if (Number.isNaN(n)) return max;
      return Math.max(max, n);
    }, 0);
    return `CL-${String(maxNumber + 1).padStart(3, '0')}`;
  }
}
