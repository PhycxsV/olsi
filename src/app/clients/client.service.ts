import { Injectable } from '@angular/core';
import { ChargingTypeId } from '../core/charging.model';
import { ClientRow, ClientStatus, ClientVehicleCharging } from './clients.component';

export interface ClientSupplierRider {
  riderId: string;
  riderName: string;
  supplierName: string;
  addedAt: string;
}

/** Shared client data for list and detail. */
@Injectable({ providedIn: 'root' })
export class ClientService {
  private clients: ClientRow[] = [
    {
      id: '1',
      clientId: 'CL-001',
      name: 'FreshMart Philippines',
      status: 'Active',
      vehicleCharging: [{ vehicleTypeId: 'van', chargingTypeId: 'per_distance' }],
      paymentTermsDays: 30,
      totalBookings: 2450,
      lastBookingAt: 'Jan 15, 2024 10:30',
      apiKeyMasked: 'sk_live_fm_a8d7f3k2l9p4m5n6',
      businessAddress: '123 Commerce Blvd, Makati City',
      webhookUrl: 'https://api.freshmart.ph/webhooks/delivery',
      registeredOn: 'June 15, 2023',
      preferredProviderId: '2',
      preferredProviderName: 'MetroFleet',
    },
    {
      id: '2',
      clientId: 'CL-002',
      name: 'QuickEats Delivery',
      status: 'Active',
      vehicleCharging: [{ vehicleTypeId: 'motorcycle', chargingTypeId: 'per_distance' }],
      paymentTermsDays: 15,
      totalBookings: 5678,
      lastBookingAt: 'Jan 15, 2024 10:15',
      apiKeyMasked: 'sk_live_qe_b7c6d5e4f3g2h1',
      businessAddress: '88 Ortigas Ave, Pasig City',
      webhookUrl: 'https://api.quickeats.ph/olsi/webhook',
      registeredOn: 'August 02, 2023',
      preferredProviderId: '1',
      preferredProviderName: 'SpeedRiders',
    },
    {
      id: '3',
      clientId: 'CL-003',
      name: 'MediPharm Express',
      status: 'Active',
      vehicleCharging: [{ vehicleTypeId: 'motorcycle', chargingTypeId: 'per_distance' }],
      paymentTermsDays: 45,
      totalBookings: 890,
      lastBookingAt: 'Jan 15, 2024 09:00',
      apiKeyMasked: 'sk_live_mp_x2y3z4a5b6c7',
      businessAddress: '32 Timog Avenue, Quezon City',
      webhookUrl: 'https://medipharm.ph/webhooks/dispatch',
      registeredOn: 'September 10, 2023',
      preferredProviderId: '3',
      preferredProviderName: 'SwiftDeliver',
    },
    {
      id: '4',
      clientId: 'CL-004',
      name: 'TechStore PH',
      status: 'Inactive',
      vehicleCharging: [{ vehicleTypeId: 'van', chargingTypeId: 'ad_valorem' }],
      paymentTermsDays: 60,
      totalBookings: 156,
      lastBookingAt: 'Dec 20, 2023 14:00',
      apiKeyMasked: 'sk_live_ts_1234abcd5678',
      businessAddress: '45 Electronics Park, Taguig City',
      webhookUrl: 'https://techstore.ph/integration/webhook',
      registeredOn: 'May 18, 2023',
      preferredProviderId: '3',
      preferredProviderName: 'SwiftDeliver',
    },
    {
      id: '5',
      clientId: 'CL-005',
      name: 'FashionHub Manila',
      status: 'Suspended',
      vehicleCharging: [{ vehicleTypeId: 'motorcycle', chargingTypeId: 'per_distance' }],
      paymentTermsDays: 30,
      totalBookings: 342,
      lastBookingAt: 'Jan 10, 2024 16:45',
      apiKeyMasked: 'sk_live_fh_zz11yy22xx33',
      businessAddress: '14 Fashion Road, Manila',
      webhookUrl: 'https://fashionhub.manila/api/webhook',
      registeredOn: 'November 05, 2023',
      preferredProviderId: '2',
      preferredProviderName: 'MetroFleet',
    },
    {
      id: '6',
      clientId: 'CL-006',
      name: 'GreenGrocers Co.',
      status: 'Active',
      vehicleCharging: [{ vehicleTypeId: '6-wheeler', chargingTypeId: 'per_distance' }],
      paymentTermsDays: 15,
      totalBookings: 1203,
      lastBookingAt: 'Jan 15, 2024 07:00',
      apiKeyMasked: 'sk_live_gg_9876mnop4321',
      businessAddress: '9 Green Market St, Mandaluyong',
      webhookUrl: 'https://greengrocers.co/integrations/olsi',
      registeredOn: 'July 25, 2023',
      preferredProviderId: '5',
      preferredProviderName: 'ExpressWay',
    },
  ];

  /**
   * Per-client designated riders.
   * Keep riders scoped to a client's assigned supplier(s) only.
   */
  private readonly clientSupplierRiders: Record<string, ClientSupplierRider[]> = {
    '1': [
      { riderId: 'R-001', riderName: 'Juan Dela Cruz', supplierName: 'MetroFleet', addedAt: 'Jan 10, 2024' },
      { riderId: 'R-010', riderName: 'Carlo Mendoza', supplierName: 'MetroFleet', addedAt: 'Jan 14, 2024' },
      { riderId: 'R-011', riderName: 'Angelica Ramos', supplierName: 'MetroFleet', addedAt: 'Jan 20, 2024' },
    ],
    '2': [
      { riderId: 'R-021', riderName: 'Nico Villanueva', supplierName: 'SpeedRiders', addedAt: 'Feb 01, 2024' },
      { riderId: 'R-022', riderName: 'Pat Lim', supplierName: 'SpeedRiders', addedAt: 'Feb 03, 2024' },
    ],
    '3': [
      { riderId: 'R-031', riderName: 'Sam Cruz', supplierName: 'SwiftDeliver', addedAt: 'Mar 08, 2024' },
      { riderId: 'R-032', riderName: 'Lea Navarro', supplierName: 'SwiftDeliver', addedAt: 'Mar 09, 2024' },
    ],
    '4': [
      { riderId: 'R-041', riderName: 'Troy Yap', supplierName: 'Expressway', addedAt: 'Apr 11, 2024' },
    ],
    '5': [
      { riderId: 'R-051', riderName: 'Mae Torres', supplierName: 'MetroFleet', addedAt: 'May 02, 2024' },
    ],
    '6': [
      { riderId: 'R-061', riderName: 'Ralph Gomez', supplierName: 'Expressway', addedAt: 'Jun 18, 2024' },
      { riderId: 'R-062', riderName: 'Ivy Dizon', supplierName: 'Expressway', addedAt: 'Jun 20, 2024' },
    ],
  };

  getClients(): ClientRow[] {
    return [...this.clients];
  }

  getClientById(id: string): ClientRow | undefined {
    return this.clients.find(c => c.id === id);
  }

  getSupplierRidersByClientId(id: string): ClientSupplierRider[] {
    return [...(this.clientSupplierRiders[id] ?? [])];
  }

  getRidersByProviderName(providerName: string): ClientSupplierRider[] {
    const target = providerName.trim().toLowerCase();
    if (!target) return [];

    const uniqueByRiderId = new Map<string, ClientSupplierRider>();
    Object.values(this.clientSupplierRiders).forEach(rows => {
      rows.forEach(row => {
        if (row.supplierName.trim().toLowerCase() !== target) return;
        if (!uniqueByRiderId.has(row.riderId)) {
          uniqueByRiderId.set(row.riderId, { ...row });
        }
      });
    });

    return [...uniqueByRiderId.values()].sort((a, b) => a.riderName.localeCompare(b.riderName));
  }

  updateClient(id: string, patch: Partial<ClientRow>): void {
    const i = this.clients.findIndex(c => c.id === id);
    if (i >= 0) this.clients[i] = { ...this.clients[i], ...patch };
  }

  addClient(client: ClientRow): void {
    this.clients.unshift(client);
  }
}
