import { Injectable } from '@angular/core';

export type DeliveryStatus =
  | 'Pending'
  | 'Unassigned'
  | 'Offered'
  | 'Assigned'
  | 'In Progress'
  | 'Completed';

export interface HistoryRow {
  bookingId: string;
  client: string;
  provider: string;
  pickup: string;
  dropoff: string;
  status: DeliveryStatus;
  amount: string;
  recordedAt: string;
  completedAt?: string | null;
}

export interface DateRange {
  start: Date;
  end: Date;
}

@Injectable({ providedIn: 'root' })
export class DeliveryHistoryService {
  private readonly records: HistoryRow[] = [
    {
      bookingId: 'BK-001',
      client: 'FreshMart',
      provider: 'SpeedRiders',
      pickup: '123 Warehouse Rd. CBD',
      dropoff: '456 Customer Ave. Makati',
      status: 'Completed',
      amount: 'P150',
      recordedAt: '2026-03-12T10:15:00',
      completedAt: '2026-03-12T10:15:00',
    },
    {
      bookingId: 'BK-002',
      client: 'QuickEats',
      provider: 'MetroFleet',
      pickup: '789 Restaurant Blvd. BGC',
      dropoff: '321 Condo Tower, Ortigas',
      status: 'Completed',
      amount: 'P85',
      recordedAt: '2026-03-11T09:25:00',
      completedAt: '2026-03-11T09:25:00',
    },
    {
      bookingId: 'BK-003',
      client: 'MediPharm',
      provider: 'SwiftDeliver',
      pickup: '555 Pharma Bldg',
      dropoff: '100 Health St. QC',
      status: 'Completed',
      amount: 'P120',
      recordedAt: '2026-03-10T15:45:00',
      completedAt: '2026-03-10T15:45:00',
    },
    {
      bookingId: 'BK-004',
      client: 'TechStore',
      provider: 'MetroFleet',
      pickup: '200 Tech Park',
      dropoff: '88 Gadget Lane',
      status: 'Assigned',
      amount: 'P200',
      recordedAt: '2026-03-13T08:00:00',
      completedAt: null,
    },
    {
      bookingId: 'BK-005',
      client: 'FreshMart',
      provider: 'SpeedRiders',
      pickup: '123 Warehouse Rd. CBD',
      dropoff: '777 Subdivision, Cavite',
      status: 'In Progress',
      amount: 'P180',
      recordedAt: '2026-03-13T11:30:00',
      completedAt: null,
    },
    {
      bookingId: 'BK-006',
      client: 'QuickEats',
      provider: 'MetroFleet',
      pickup: '789 Restaurant Blvd. BGC',
      dropoff: '50 Food Court, Pasig',
      status: 'Completed',
      amount: 'P95',
      recordedAt: '2026-03-05T12:10:00',
      completedAt: '2026-03-05T12:10:00',
    },
    {
      bookingId: 'BK-007',
      client: 'GreenGrocers',
      provider: 'SwiftDeliver',
      pickup: '400 Farm Rd.',
      dropoff: '22 Market St.',
      status: 'Completed',
      amount: 'P160',
      recordedAt: '2026-03-03T17:20:00',
      completedAt: '2026-03-03T17:20:00',
    },
    {
      bookingId: 'BK-008',
      client: 'FashionHub',
      provider: 'ExpressWay',
      pickup: '600 Mall Ave.',
      dropoff: '15 Residence Blvd.',
      status: 'Pending',
      amount: 'P140',
      recordedAt: '2026-03-13T13:20:00',
      completedAt: null,
    },
    {
      bookingId: 'BK-009',
      client: 'FreshMart',
      provider: 'SpeedRiders',
      pickup: '123 Warehouse Rd. CBD',
      dropoff: '101 Sunset Villas, Taguig',
      status: 'Completed',
      amount: 'P210',
      recordedAt: '2026-03-01T16:00:00',
      completedAt: '2026-03-01T16:00:00',
    },
    {
      bookingId: 'BK-010',
      client: 'TechStore',
      provider: 'MetroFleet',
      pickup: '200 Tech Park',
      dropoff: '10 Circuit Lane, Makati',
      status: 'Completed',
      amount: 'P260',
      recordedAt: '2026-02-26T10:40:00',
      completedAt: '2026-02-26T10:40:00',
    },
    {
      bookingId: 'BK-011',
      client: 'MediPharm',
      provider: 'SwiftDeliver',
      pickup: '555 Pharma Bldg',
      dropoff: '205 Care Ave., Pasig',
      status: 'Completed',
      amount: 'P175',
      recordedAt: '2026-02-22T14:35:00',
      completedAt: '2026-02-22T14:35:00',
    },
    {
      bookingId: 'BK-012',
      client: 'GreenGrocers',
      provider: 'ExpressWay',
      pickup: '400 Farm Rd.',
      dropoff: '65 Market St., Manila',
      status: 'Completed',
      amount: 'P190',
      recordedAt: '2026-03-09T18:10:00',
      completedAt: '2026-03-09T18:10:00',
    },
  ];

  getRecords(): HistoryRow[] {
    return this.records.map(record => ({ ...record }));
  }

  getCompletedDeliveriesForProvider(providerName: string, range?: DateRange): HistoryRow[] {
    const target = providerName.trim().toLowerCase();

    return this.records
      .filter(record => {
        if (record.status !== 'Completed' || !record.completedAt) {
          return false;
        }
        if (record.provider.trim().toLowerCase() !== target) {
          return false;
        }

        if (!range) {
          return true;
        }

        const completedAt = new Date(record.completedAt);
        return this.isWithinRange(completedAt, range);
      })
      .map(record => ({ ...record }));
  }

  sumAmounts(records: HistoryRow[]): number {
    return records.reduce((sum, record) => sum + this.parseAmount(record.amount), 0);
  }

  parseAmount(amount: string): number {
    return parseInt((amount || '').replace(/[^\d]/g, ''), 10) || 0;
  }

  formatCurrency(amount: number): string {
    const rounded = Math.round(amount);
    const sign = rounded < 0 ? '-' : '';
    return `${sign}P${Math.abs(rounded).toLocaleString()}`;
  }

  getRecordDate(record: HistoryRow): Date | null {
    const raw = record.completedAt || record.recordedAt;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private isWithinRange(date: Date, range: DateRange): boolean {
    const start = range.start.getTime();
    const end = range.end.getTime();
    const value = date.getTime();
    return value >= start && value <= end;
  }
}
