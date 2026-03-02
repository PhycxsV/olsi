import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateBookingDialogComponent } from './create-booking-dialog/create-booking-dialog.component';
import {
  BookingDetailDialogComponent,
  BookingDetailData,
  BookingEligibleProvider,
} from './booking-detail-dialog/booking-detail-dialog.component';
import {
  AssignProviderDialogComponent,
  AssignProviderOption,
} from './assign-provider-dialog/assign-provider-dialog.component';
import {
  BookingPriorityFlowDialogComponent,
} from './booking-priority-flow-dialog/booking-priority-flow-dialog.component';

export type ViewMode = 'table' | 'cards';

export interface BookingListRow {
  status: string;
  orderNo: string;
  bookingId?: string; // e.g. BK-003, BK-004 for detail panel
  createdDate: string;
  destination: string;
  rider: string;
  amount: string;
}

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss'],
})
export class BookingsComponent {
  searchText = '';
  statusFilter = '';
  paymentFilter = '';
  branchFilter = 'all';
  dateStart: Date | null = null;
  dateEnd: Date | null = null;
  viewMode: ViewMode = 'table';

  listData: BookingListRow[] = [
    { status: 'Pending', orderNo: 'ORD-101', bookingId: 'BK-001', createdDate: '2025-02-22 09:00', destination: 'Manila', rider: '—', amount: '₱ 150' },
    { status: 'Active', orderNo: 'ORD-102', bookingId: 'BK-002', createdDate: '2025-02-22 08:30', destination: 'Quezon City', rider: 'Juan D.', amount: '₱ 280' },
    { status: 'Completed', orderNo: 'ORD-103', bookingId: 'BK-003', createdDate: '2025-02-21 14:00', destination: 'Makati', rider: 'Maria S.', amount: '₱ 320' },
    { status: 'Assigned', orderNo: 'ORD-104', bookingId: 'BK-004', createdDate: '2025-02-21 11:00', destination: 'Taguig', rider: 'MetroFleet', amount: '₱ 350' },
    { status: 'Active', orderNo: 'ORD-105', bookingId: 'BK-005', createdDate: '2025-02-22 07:15', destination: 'Taguig', rider: 'Pedro L.', amount: '₱ 195' },
  ];

  filteredList: BookingListRow[] = [];
  statusOptions = ['', 'Pending', 'Active', 'Assigned', 'Completed', 'Cancelled', 'Returned'];
  branches = [{ value: 'all', label: 'All Branches' }, { value: 'b1', label: 'Branch 1' }];

  displayedColumns = ['status', 'orderNo', 'createdDate', 'destination', 'rider', 'amount'];

  /** Row for which the 3-dot menu is open (card view) */
  menuRow: BookingListRow | null = null;

  constructor(private dialog: MatDialog) {
    this.applyListFilters();
  }

  onAddBooking(): void {
    this.dialog.open(CreateBookingDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
    }).afterClosed().subscribe(result => {
      if (result) {
        this.openPriorityFlow(result.clientId);
        this.applyListFilters();
      }
    });
  }

  openPriorityFlow(accountId: string, tier1WindowMinutes?: number): void {
    this.dialog.open(BookingPriorityFlowDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '100vh',
      data: { accountId, tier1WindowMinutes: tier1WindowMinutes ?? 4 },
      panelClass: 'booking-priority-flow-dialog',
    }).afterClosed().subscribe(() => this.applyListFilters());
  }

  applyListFilters(): void {
    let list = [...this.listData];
    if (this.statusFilter) {
      list = list.filter(b => b.status === this.statusFilter);
    }
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      list = list.filter(b =>
        (b.orderNo && b.orderNo.toLowerCase().includes(q)) ||
        (b.bookingId && b.bookingId.toLowerCase().includes(q)) ||
        (b.destination && b.destination.toLowerCase().includes(q))
      );
    }
    this.filteredList = list;
  }

  exportCsv(): void {
    const headers = this.displayedColumns.join(',');
    const rows = this.filteredList.map(r => `${r.status},${r.orderNo},${r.createdDate},${r.destination},${r.rider},${r.amount}`);
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  getBookingDetail(row: BookingListRow): BookingDetailData {
    const id = row.bookingId || row.orderNo;
    const built = this.buildDetailFromRow(row, id);
    const overrides = this.getDetailOverrides(row.orderNo, row.bookingId || id);
    return { ...built, ...overrides };
  }

  private buildDetailFromRow(row: BookingListRow, id: string): BookingDetailData {
    return {
      id,
      status: row.status,
      clientName: 'Client',
      clientSource: 'Dashboard',
      pickupAddress: '—',
      pickupTime: '—',
      dropoffAddress: row.destination,
      dropoffTime: '—',
      packageType: 'Standard',
      slaMinutes: 60,
      amount: row.amount,
      createdTime: row.createdDate,
      eligibleProviders: [],
      assignmentHistory: [],
    };
  }

  private getDetailOverrides(orderNo: string, id: string): Partial<BookingDetailData> | null {
    const details: Record<string, Partial<BookingDetailData>> = {
      'ORD-101': {
        id: 'BK-001',
        status: 'Pending',
        clientName: 'Retail Plus Inc.',
        clientSource: 'Dashboard (walk-in)',
        pickupAddress: '45 Rizal Ave, Ermita, Manila',
        pickupTime: '09:30 AM',
        dropoffAddress: '88 Quiapo Market Rd, Manila',
        dropoffTime: '10:30 AM',
        packageType: 'Documents',
        slaMinutes: 45,
        amount: '₱ 150',
        createdTime: '09:00 AM',
        eligibleProviders: [
          { id: 'sr', name: 'SpeedRiders', initial: 'S', riders: 42, slaPercent: 97, isAssigned: false },
          { id: 'mf', name: 'MetroFleet', initial: 'M', riders: 30, slaPercent: 92, isAssigned: false },
          { id: 'sd', name: 'SwiftDeliver', initial: 'S', riders: 22, slaPercent: 99, isAssigned: false },
        ],
        assignmentHistory: [
          { event: 'Booking created', time: '09:00 AM', dotColor: 'green' },
          { event: 'Awaiting provider assignment', time: '—', dotColor: 'yellow' },
        ],
      },
      'ORD-102': {
        id: 'BK-002',
        status: 'Active',
        clientName: 'FoodHub Delivery',
        clientSource: 'via API Integration',
        pickupAddress: '200 Timog Ave, Quezon City',
        pickupTime: '08:45 AM',
        dropoffAddress: '55 Eastwood Ave, Quezon City',
        dropoffTime: '09:30 AM',
        packageType: 'Food & Beverage',
        slaMinutes: 60,
        amount: '₱ 280',
        createdTime: '08:30 AM',
        eligibleProviders: [
          { id: 'sr', name: 'SpeedRiders', initial: 'S', riders: 42, slaPercent: 97, isAssigned: false },
          { id: 'mf', name: 'MetroFleet', initial: 'M', riders: 30, slaPercent: 92, isAssigned: true },
        ],
        assignmentHistory: [
          { event: 'Booking created', time: '08:30 AM', dotColor: 'green' },
          { event: 'Sent to MetroFleet', time: '08:32 AM', dotColor: 'green' },
          { event: 'Accepted by Juan D.', time: '08:35 AM', dotColor: 'blue' },
          { event: 'In transit', time: '08:45 AM', dotColor: 'blue' },
        ],
      },
      'ORD-103': {
        id: 'BK-003',
        status: 'Completed',
        clientName: 'TechStore PH',
        clientSource: 'via API Integration',
        pickupAddress: '999 Gadget Plaza, Pasig',
        pickupTime: '09:00 AM',
        dropoffAddress: '111 Office Bldg, Makati',
        dropoffTime: '10:00 AM',
        packageType: 'Electronics',
        slaMinutes: 60,
        amount: '₱ 320',
        createdTime: '08:30 AM',
        eligibleProviders: [
          { id: 'sr', name: 'SpeedRiders', initial: 'S', riders: 42, slaPercent: 97, isAssigned: false },
          { id: 'mf', name: 'MetroFleet', initial: 'M', riders: 30, slaPercent: 92, isAssigned: false },
          { id: 'sd', name: 'SwiftDeliver', initial: 'S', riders: 22, slaPercent: 99, isAssigned: true },
          { id: 'ew', name: 'Expressway', initial: 'E', riders: 18, slaPercent: 94, isAssigned: false },
        ],
        assignmentHistory: [
          { event: 'Booking created', time: '08:30 AM', dotColor: 'green' },
          { event: 'Sent to SwiftDeliver', time: '08:32 AM', dotColor: 'green' },
          { event: 'Assigned to Maria S.', time: '08:35 AM', dotColor: 'blue' },
          { event: 'Delivered', time: '10:00 AM', dotColor: 'green' },
        ],
      },
      'ORD-104': {
        id: 'BK-004',
        status: 'Assigned',
        clientName: 'TechStore PH',
        clientSource: 'via API Integration',
        pickupAddress: '999 Gadget Plaza, Pasig',
        pickupTime: '11:00 AM',
        dropoffAddress: '111 Office Bldg, Taguig',
        dropoffTime: '12:00 PM',
        packageType: 'Electronics',
        slaMinutes: 60,
        amount: '₱ 350',
        createdTime: '10:30 AM',
        eligibleProviders: [
          { id: 'sr', name: 'SpeedRiders', initial: 'S', riders: 42, slaPercent: 97, isAssigned: false },
          { id: 'mf', name: 'MetroFleet', initial: 'M', riders: 30, slaPercent: 92, isAssigned: true },
          { id: 'sd', name: 'SwiftDeliver', initial: 'S', riders: 22, slaPercent: 99, isAssigned: false },
        ],
        assignmentHistory: [
          { event: 'Booking created', time: '10:00 AM', dotColor: 'green' },
          { event: 'Sent to SpeedRiders', time: '10:02 AM', dotColor: 'green' },
          { event: 'Offer declined', time: '10:05 AM', dotColor: 'yellow' },
          { event: 'Sent to MetroFleet', time: '10:06 AM', dotColor: 'blue' },
          { event: 'Assigned', time: '10:08 AM', dotColor: 'blue' },
        ],
      },
      'ORD-105': {
        id: 'BK-005',
        status: 'Active',
        clientName: 'MedSupply Co.',
        clientSource: 'via API Integration',
        pickupAddress: '12 BGC High Street, Taguig',
        pickupTime: '07:30 AM',
        dropoffAddress: '77 McKinley Rd, Taguig',
        dropoffTime: '08:15 AM',
        packageType: 'Medical Supplies',
        slaMinutes: 90,
        amount: '₱ 195',
        createdTime: '07:15 AM',
        eligibleProviders: [
          { id: 'mf', name: 'MetroFleet', initial: 'M', riders: 30, slaPercent: 92, isAssigned: false },
          { id: 'sd', name: 'SwiftDeliver', initial: 'S', riders: 22, slaPercent: 99, isAssigned: true },
        ],
        assignmentHistory: [
          { event: 'Booking created', time: '07:15 AM', dotColor: 'green' },
          { event: 'Sent to SwiftDeliver', time: '07:18 AM', dotColor: 'green' },
          { event: 'Accepted by Pedro L.', time: '07:22 AM', dotColor: 'blue' },
          { event: 'Picked up', time: '07:30 AM', dotColor: 'blue' },
        ],
      },
    };
    return details[orderNo] || null;
  }

  openDetail(row: BookingListRow): void {
    const detail = this.getBookingDetail(row);
    const ref = this.dialog.open(BookingDetailDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      height: '100%',
      maxHeight: '100vh',
      position: { right: '0', top: '0' },
      data: detail,
      panelClass: 'booking-detail-dialog-right',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '250ms',
    });
    ref.afterClosed().subscribe((result: string | { action: string; provider: BookingEligibleProvider } | undefined) => {
      if (result === 'reassign') {
        this.openAssignProviderModal(detail.id);
      } else if (result && typeof result === 'object' && result.action === 'assign') {
        this.openAssignProviderModal(detail.id, result.provider?.id);
      }
    });
  }

  openAssignProviderModal(bookingId: string, preSelectedProviderId?: string): void {
    const options: AssignProviderOption[] = [
      { id: 'sr', name: 'SpeedRiders', initial: 'S', serviceArea: 'Metro Manila, Cavite', capacityCurrent: 42, capacityTotal: 50, slaPercent: 97 },
      { id: 'mf', name: 'MetroFleet', initial: 'M', serviceArea: 'Metro Manila, Rizal', capacityCurrent: 30, capacityTotal: 35, slaPercent: 92 },
      { id: 'sd', name: 'SwiftDeliver', initial: 'S', serviceArea: 'Makati, BGC, Pasig, Taguig', capacityCurrent: 22, capacityTotal: 25, slaPercent: 99 },
      { id: 'ew', name: 'Expressway', initial: 'E', serviceArea: 'Metro Manila', capacityCurrent: 18, capacityTotal: 30, slaPercent: 94 },
    ];
    const ref = this.dialog.open(AssignProviderDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      height: '100%',
      maxHeight: '100vh',
      position: { right: '0', top: '0' },
      data: { bookingId, providers: options, selectedProviderId: preSelectedProviderId ?? null },
      panelClass: 'assign-provider-sheet-right',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '250ms',
    });
    ref.afterClosed().subscribe((provider: AssignProviderOption | null) => {
      if (provider) {
        console.log('Assigned provider', provider, 'to booking', bookingId);
        this.applyListFilters();
      }
    });
  }

  setMenuRow(row: BookingListRow): void {
    this.menuRow = row;
  }

  runMenuAction(action: 'view' | 'assign' | 'cancel'): void {
    const row = this.menuRow;
    this.menuRow = null;
    if (!row) return;
    if (action === 'view') this.openDetail(row);
    else if (action === 'assign') this.openAssignFromCard(row);
    else if (action === 'cancel') this.cancelBooking(row);
  }

  openAssignFromCard(row: BookingListRow): void {
    const bookingId = row.bookingId || row.orderNo;
    this.openAssignProviderModal(bookingId);
  }

  cancelBooking(row: BookingListRow): void {
    const id = row.bookingId || row.orderNo;
    const confirmed = window.confirm(
      `Cancel booking ${id}? This action cannot be undone.`
    );
    if (confirmed) {
      const item = this.listData.find(b => b.orderNo === row.orderNo);
      if (item) {
        item.status = 'Cancelled';
        item.rider = '—';
        this.applyListFilters();
      }
    }
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  getStatusClass(status: string): string {
    const m: Record<string, string> = {
      Pending: 'badge-pending',
      Active: 'badge-active',
      Assigned: 'badge-assigned',
      Completed: 'badge-completed',
      Cancelled: 'badge-cancelled',
      Returned: 'badge-returned',
    };
    return m[status] || 'badge-pending';
  }
}
