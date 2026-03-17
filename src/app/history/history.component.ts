import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DeliveryHistoryService, HistoryRow } from '../core/services/delivery-history.service';
import { HistoryDetailDialogComponent } from './history-detail-dialog/history-detail-dialog.component';

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
  records: HistoryRow[] = [];

  dateOptions = [{ value: '', label: 'All Dates' }, { value: 'today', label: 'Today' }, { value: 'week', label: 'This Week' }, { value: 'month', label: 'This Month' }];
  clientOptions = [{ value: '', label: 'All Clients' }];
  providerOptions = [{ value: '', label: 'All Providers' }];

  filteredRecords: HistoryRow[] = [];
  displayedColumns = ['bookingId', 'client', 'provider', 'pickup', 'dropoff', 'status', 'amount'];

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private deliveryHistoryService: DeliveryHistoryService,
  ) {}

  ngOnInit(): void {
    this.records = this.deliveryHistoryService.getRecords();
    this.clientOptions = this.buildOptions(this.records.map(record => record.client), 'All Clients');
    this.providerOptions = this.buildOptions(
      this.records.map(record => record.provider).filter(provider => provider !== '—'),
      'All Providers',
    );

    this.route.queryParams.subscribe(params => {
      const order = params['order'];
      if (order) {
        const row = this.records.find(r => r.bookingId === order);
        if (row) {
          this.openDetail(row);
        }
      }
    });
    this.applyFilters();
  }

  get totalDeliveries(): number {
    return this.filteredRecords.length;
  }

  get totalRevenue(): string {
    const sum = this.deliveryHistoryService.sumAmounts(this.filteredRecords);
    return this.deliveryHistoryService.formatCurrency(sum);
  }

  get avgDeliveryTime(): string {
    return '32min';
  }

  get avgTimeDelta(): string {
    return '↑ 5min from last week';
  }

  applyFilters(): void {
    let list = [...this.records];
    if (this.dateFilter) {
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      if (this.dateFilter === 'week') {
        start.setDate(now.getDate() - 6);
      } else if (this.dateFilter === 'month') {
        start.setDate(1);
      }

      list = list.filter(record => {
        const recordDate = this.deliveryHistoryService.getRecordDate(record);
        if (!recordDate) return false;
        if (this.dateFilter === 'today') {
          return recordDate >= start;
        }
        return recordDate >= start && recordDate <= now;
      });
    }
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
    const headers = [...this.displayedColumns, 'recordedAt', 'completedAt'].join(',');
    const rows = this.filteredRecords.map(r =>
      `${r.bookingId},${r.client},${r.provider},"${r.pickup}","${r.dropoff}",${r.status},${r.amount},${r.recordedAt},${r.completedAt ?? ''}`
    );
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
    this.dialog.open(HistoryDetailDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      height: '100%',
      maxHeight: '100vh',
      position: { right: '0', top: '0' },
      data: row,
      panelClass: 'provider-detail-dialog-right',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '250ms',
    });
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

  private buildOptions(values: string[], allLabel: string): Array<{ value: string; label: string }> {
    const unique = [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return [{ value: '', label: allLabel }, ...unique.map(value => ({ value, label: value }))];
  }
}
