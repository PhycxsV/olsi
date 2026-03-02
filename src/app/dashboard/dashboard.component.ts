import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  loading = false;
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  branchControl = new FormControl('all');
  branches = [{ value: 'all', label: 'All Branches' }, { value: 'b1', label: 'Branch 1' }, { value: 'b2', label: 'Branch 2' }];

  summaryCards = [
    { title: 'Total Bookings', value: '1,247', icon: 'collections_bookmark', bgClass: 'card-light-blue' },
    { title: "Today's Bookings", value: '32', icon: 'today', bgClass: 'card-amber' },
    { title: 'Total Revenue', value: '₱ 284,500', icon: 'attach_money', bgClass: 'card-green' },
    { title: "Today's Revenue", value: '₱ 8,200', icon: 'trending_up', bgClass: 'card-pink' },
    { title: 'Active Riders', value: '18', icon: 'two_wheeler', bgClass: 'card-indigo' },
  ];

  chartPeriods = [
    { label: 'Today', count: 32 },
    { label: 'Yesterday', count: 28 },
    { label: 'Last Week', count: 186 },
  ];
  chartMax = 200;

  providerMetrics = [
    { label: 'Active bookings', value: 12 },
    { label: 'Unassigned', value: 3 },
    { label: 'In progress', value: 9 },
    { label: 'Completed today', value: 24 },
  ];

  statusOverview = [
    { label: 'Pending', count: 8, total: 32, percent: 25, color: '#fbbf24', subStatuses: ['NotStarted', 'Queued', 'Draft'] },
    { label: 'Active', count: 12, total: 32, percent: 37.5, color: '#10b981', subStatuses: ['OnGoing', 'RiderArrived', 'Accepted'] },
    { label: 'Completed', count: 6, total: 32, percent: 18.75, color: '#059669', subStatuses: ['Delivered'] },
    { label: 'Cancelled', count: 4, total: 32, percent: 12.5, color: '#ef4444', subStatuses: ['Cancelled'] },
    { label: 'Returned', count: 2, total: 32, percent: 6.25, color: '#dc2626', subStatuses: ['Returned'] },
  ];

  clearDates(): void {
    this.dateRange.reset();
    this.branchControl.setValue('all');
  }
}
