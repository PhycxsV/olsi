import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientSupplierRider } from '../../clients/client.service';
import { ProviderCard } from '../providers.component';

export interface ProviderDetailDialogData {
  provider: ProviderCard;
  riders: ClientSupplierRider[];
}

@Component({
  selector: 'app-provider-detail-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-main">
          <div class="provider-avatar">{{ getInitial(data.provider.name) }}</div>
          <div class="header-title-block">
            <h2 class="dialog-title">{{ data.provider.name }}</h2>
            <span class="header-subtitle">{{ data.provider.location }}</span>
          </div>
        </div>
        <div class="header-actions">
          <span class="status-pill" [class.paused]="data.provider.status === 'Paused'">{{ data.provider.status }}</span>
          <button mat-icon-button (click)="close()" aria-label="Close">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <div class="dialog-body">
        <div class="top-actions">
          <button mat-stroked-button color="primary" (click)="editProvider()">Edit Provider</button>
        </div>

        <section class="metrics-grid">
          <article class="metric-card">
            <span class="metric-label">Riders</span>
            <strong class="metric-value">{{ data.provider.activeRiders }}/{{ data.provider.totalRiders }}</strong>
          </article>
          <article class="metric-card">
            <span class="metric-label">Avg. Time</span>
            <strong class="metric-value">{{ data.provider.avgTimeMin }} min</strong>
          </article>
          <article class="metric-card">
            <span class="metric-label">Acceptance</span>
            <strong class="metric-value">{{ data.provider.acceptancePercent }}%</strong>
          </article>
          <article class="metric-card">
            <span class="metric-label">SLA</span>
            <strong class="metric-value">{{ data.provider.slaPercent }}%</strong>
          </article>
        </section>

        <section class="section-card">
          <h3 class="section-title">Operational Summary</h3>
          <div class="detail-row">
            <span>Service Area</span>
            <strong>{{ data.provider.location }}</strong>
          </div>
          <div class="detail-row">
            <span>Deliveries Today</span>
            <strong>{{ data.provider.deliveriesToday }}</strong>
          </div>
          <div class="detail-row">
            <span>Status</span>
            <strong>{{ data.provider.status }}</strong>
          </div>
        </section>

        <section class="section-card">
          <h3 class="section-title">Riders</h3>
          <div class="rider-list" *ngIf="data.riders.length; else noRiders">
            <article class="rider-card" *ngFor="let row of data.riders">
              <div class="rider-head">
                <h4>{{ row.riderName }}</h4>
                <span>{{ row.riderId }}</span>
              </div>
              <div class="rider-meta">
                <p><span>Added</span>{{ row.addedAt }}</p>
              </div>
            </article>
          </div>
          <ng-template #noRiders>
            <p class="empty-state">No riders linked to this provider yet.</p>
          </ng-template>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./provider-detail-dialog.component.scss'],
})
export class ProviderDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProviderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProviderDetailDialogData,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  editProvider(): void {
    this.dialogRef.close({ action: 'edit' });
  }

  getInitial(name: string): string {
    return (name || 'P').charAt(0).toUpperCase();
  }
}
