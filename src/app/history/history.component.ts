import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export type DeliveryStatus = 'Pending' | 'Unassigned' | 'Offered' | 'Assigned' | 'In Progress' | 'Completed';

export interface HistoryRow {
  bookingId: string;
  client: string;
  provider: string;
  pickup: string;
  dropoff: string;
  status: DeliveryStatus;
  amount: string;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  searchText = '';
  dateFilter = '';
  clientFilter = '';
  providerFilter = '';
  drawerOpen = false;
  selectedRow: HistoryRow | null = null;
  detailTabIndex = 0;

  records: HistoryRow[] = [
    { bookingId: 'BK-001', client: 'FreshMart', provider: 'SpeedRiders', pickup: '123 Warehouse Rd. CBD', dropoff: '456 Customer Ave. Makati', status: 'Pending', amount: '₱150' },
    { bookingId: 'BK-002', client: 'QuickEats', provider: '—', pickup: '789 Restaurant Blvd. BGC', dropoff: '321 Condo Tower, Ortigas', status: 'Unassigned', amount: '₱85' },
    { bookingId: 'BK-003', client: 'MediPharm', provider: '—', pickup: '555 Pharma Bldg', dropoff: '100 Health St. QC', status: 'Offered', amount: '₱120' },
    { bookingId: 'BK-004', client: 'TechStore', provider: 'MetroFleet', pickup: '200 Tech Park', dropoff: '88 Gadget Lane', status: 'Assigned', amount: '₱200' },
    { bookingId: 'BK-005', client: 'FreshMart', provider: 'SpeedRiders', pickup: '123 Warehouse Rd. CBD', dropoff: '777 Subdivision, Cavite', status: 'In Progress', amount: '₱180' },
    { bookingId: 'BK-006', client: 'QuickEats', provider: 'MetroFleet', pickup: '789 Restaurant Blvd. BGC', dropoff: '50 Food Court, Pasig', status: 'Completed', amount: '₱95' },
    { bookingId: 'BK-007', client: 'GreenGrocers', provider: 'SwiftDeliver', pickup: '400 Farm Rd.', dropoff: '22 Market St.', status: 'Completed', amount: '₱160' },
    { bookingId: 'BK-008', client: 'FashionHub', provider: '—', pickup: '600 Mall Ave.', dropoff: '15 Residence Blvd.', status: 'Pending', amount: '₱140' },
  ];

  dateOptions = [{ value: '', label: 'All Dates' }, { value: 'today', label: 'Today' }, { value: 'week', label: 'This Week' }, { value: 'month', label: 'This Month' }];
  clientOptions = [{ value: '', label: 'All Clients' }, { value: 'FreshMart', label: 'FreshMart' }, { value: 'QuickEats', label: 'QuickEats' }, { value: 'MediPharm', label: 'MediPharm' }, { value: 'TechStore', label: 'TechStore' }, { value: 'GreenGrocers', label: 'GreenGrocers' }, { value: 'FashionHub', label: 'FashionHub' }];
  providerOptions = [{ value: '', label: 'All Providers' }, { value: 'SpeedRiders', label: 'SpeedRiders' }, { value: 'MetroFleet', label: 'MetroFleet' }, { value: 'SwiftDeliver', label: 'SwiftDeliver' }];

  filteredRecords: HistoryRow[] = [];
  displayedColumns = ['bookingId', 'client', 'provider', 'pickup', 'dropoff', 'status', 'amount'];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const order = params['order'];
      if (order) {
        const row = this.records.find(r => r.bookingId === order);
        if (row) {
          this.selectedRow = row;
          this.drawerOpen = true;
        }
      }
    });
    this.applyFilters();
  }

  get totalDeliveries(): number {
    return this.filteredRecords.length;
  }

  get totalRevenue(): string {
    const sum = this.filteredRecords.reduce((acc, r) => {
      const n = parseInt(r.amount.replace(/[^\d]/g, ''), 10) || 0;
      return acc + n;
    }, 0);
    return `₱${sum}`;
  }

  get avgDeliveryTime(): string {
    return '32min';
  }

  get avgTimeDelta(): string {
    return '↑ 5min from last week';
  }

  applyFilters(): void {
    let list = [...this.records];
    if (this.clientFilter) {
      list = list.filter(r => r.client === this.clientFilter);
    }
    if (this.providerFilter) {
      list = list.filter(r => r.provider === this.providerFilter);
    }
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      list = list.filter(r =>
        r.bookingId.toLowerCase().includes(q) ||
        r.client.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        r.pickup.toLowerCase().includes(q) ||
        r.dropoff.toLowerCase().includes(q)
      );
    }
    this.filteredRecords = list;
  }

  exportCsv(): void {
    const headers = this.displayedColumns.join(',');
    const rows = this.filteredRecords.map(r => `${r.bookingId},${r.client},${r.provider},"${r.pickup}","${r.dropoff}",${r.status},${r.amount}`);
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'delivery-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  openDetail(row: HistoryRow): void {
    this.selectedRow = row;
    this.detailTabIndex = 0;
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedRow = null;
  }

  getStatusClass(status: string): string {
    const m: Record<string, string> = {
      Pending: 'badge-pending',
      Unassigned: 'badge-unassigned',
      Offered: 'badge-offered',
      Assigned: 'badge-assigned',
      'In Progress': 'badge-in-progress',
      Completed: 'badge-completed',
    };
    return m[status] || 'badge-pending';
  }
}
