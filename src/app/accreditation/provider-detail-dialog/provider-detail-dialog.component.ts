import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import type { AccreditationProvider, AccreditationStatus, ProviderDocument } from '../../core/models/accreditation.model';
import { KeriProvidersApiService } from '../../core/api/keri-providers-api.service';
import { formatExpiryApiDate } from '../../core/api/keri-mapper';
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
    private keriApi: KeriProvidersApiService,
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

  getDocumentStatusClass(status: string): string {
    if (status === 'Verified') return 'status-verified';
    if (status === 'Rejected') return 'status-rejected';
    if (status === 'Under Review') return 'status-under-review';
    return 'status-pending';
  }

  getDocumentStatusIcon(status: string): string {
    if (status === 'Verified') return 'check_circle';
    if (status === 'Rejected') return 'cancel';
    if (status === 'Under Review') return 'schedule';
    return 'schedule';
  }

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.dialogRef.close({ action: 'edit' });
  }

  onFileSelectedForDoc(event: Event, doc: ProviderDocument): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    if (!this.keriApi.isConfigured()) {
      const now = new Date();
      const uploadedAt =
        now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
        ' ' +
        now.toTimeString().slice(0, 5);
      doc.filename = file.name;
      doc.uploadedAt = uploadedAt;
      doc.uploadedBy = 'Current user';
      doc.status = 'Pending';
      return;
    }

    const providerId = String(this.provider.apiProviderId ?? this.provider.id);
    const docId = doc.providerDocumentId;
    if (!docId) {
      window.alert(
        'This document has no server id. Upload requires provider data loaded from the API (with document ids).',
      );
      return;
    }
    const expiry = formatExpiryApiDate(doc.expiryDate) || new Date().toISOString().slice(0, 10);
    this.keriApi
      .uploadProviderDocument({
        providerId,
        providerDocumentId: docId,
        expiryDate: expiry,
        file,
      })
      .subscribe({
        next: () => {
          const now = new Date();
          doc.filename = file.name;
          doc.uploadedAt =
            now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
            ' ' +
            now.toTimeString().slice(0, 5);
          doc.uploadedBy = 'Current user';
          doc.status = 'Pending';
        },
        error: err => {
          const msg = err?.error?.error?.message || err?.error?.message || err?.message || 'Upload failed.';
          window.alert(typeof msg === 'string' ? msg : 'Upload failed.');
        },
      });
  }

  formatExpiryDisplay(doc: ProviderDocument): string {
    if (!doc.expiryDate) return 'Not set';
    const d = new Date(doc.expiryDate);
    if (isNaN(d.getTime())) return 'Not set';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  openExpiryDialog(doc: ProviderDocument): void {
    this.matDialog
      .open(ExpiryDateDialogComponent, {
        width: '520px',
        maxWidth: '94vw',
        data: { document: doc },
      })
      .afterClosed()
      .subscribe((closedDoc: ProviderDocument | undefined) => {
        if (!closedDoc?.providerDocumentId || !this.keriApi.isConfigured()) return;
        const exp = formatExpiryApiDate(closedDoc.expiryDate);
        if (!exp) return;
        this.keriApi.updateProviderDocumentExpiry(closedDoc.providerDocumentId, exp).subscribe({
          error: err => console.error(err),
        });
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
