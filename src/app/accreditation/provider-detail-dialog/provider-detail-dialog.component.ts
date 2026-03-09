import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AccreditationProvider, AccreditationStatus, ProviderDocument } from '../accreditation.component';
import { ExpiryDateDialogComponent } from './expiry-date-dialog/expiry-date-dialog.component';
import { DocumentViewDialogComponent, DocumentViewDialogData } from './document-view-dialog/document-view-dialog.component';

@Component({
  selector: 'app-provider-detail-dialog',
  templateUrl: './provider-detail-dialog.component.html',
  styleUrls: ['./provider-detail-dialog.component.scss'],
})
export class ProviderDetailDialogComponent {
  activeTabIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<ProviderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public provider: AccreditationProvider,
    private matDialog: MatDialog,
  ) {}

  get progressPercent(): number {
    return this.provider.documentsTotal
      ? Math.round((this.provider.documentsVerified / this.provider.documentsTotal) * 100)
      : 0;
  }

  getStatusClass(status: AccreditationStatus): string {
    const m: Record<AccreditationStatus, string> = {
      'Accredited': 'badge-accredited',
      'In Review': 'badge-in-review',
      'Pending': 'badge-pending',
      'Rejected': 'badge-rejected',
    };
    return m[status] || 'badge-pending';
  }

  close(): void {
    this.dialogRef.close();
  }

  onFileSelectedForDoc(event: Event, doc: ProviderDocument): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const now = new Date();
    const uploadedAt = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + now.toTimeString().slice(0, 5);
    doc.filename = file.name;
    doc.uploadedAt = uploadedAt;
    doc.uploadedBy = 'Current user';
    doc.status = 'Pending';
    input.value = '';
  }

  formatExpiryDisplay(doc: ProviderDocument): string {
    if (!doc.expiryDate) return 'Not set';
    const d = new Date(doc.expiryDate);
    if (isNaN(d.getTime())) return 'Not set';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  openExpiryDialog(doc: ProviderDocument): void {
    this.matDialog.open(ExpiryDateDialogComponent, {
      width: '520px',
      maxWidth: '94vw',
      data: { document: doc },
    });
  }

  onExpiryChange(): void {
    // Expiry dates are bound to doc.expiryDate; dashboard reads from provider list for alerts
  }

  viewDocument(doc: ProviderDocument): void {
    this.matDialog.open(DocumentViewDialogComponent, {
      width: '520px',
      maxWidth: '94vw',
      data: { document: doc, provider: this.provider } as DocumentViewDialogData,
      panelClass: 'document-view-dialog-panel',
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
