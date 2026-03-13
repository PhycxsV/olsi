import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HistoryRow } from '../../core/services/delivery-history.service';

@Component({
  selector: 'app-history-detail-dialog',
  templateUrl: './history-detail-dialog.component.html',
  styleUrls: ['./history-detail-dialog.component.scss'],
})
export class HistoryDetailDialogComponent {
  detailTabIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<HistoryDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public booking: HistoryRow,
  ) {}

  close(): void {
    this.dialogRef.close();
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
