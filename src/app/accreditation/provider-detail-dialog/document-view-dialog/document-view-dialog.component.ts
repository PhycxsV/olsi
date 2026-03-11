import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccreditationProvider, ProviderDocument } from '../../accreditation.component';

export interface DocumentViewDialogData {
  document: ProviderDocument;
  provider: AccreditationProvider;
}

@Component({
  selector: 'app-document-view-dialog',
  templateUrl: './document-view-dialog.component.html',
  styleUrls: ['./document-view-dialog.component.scss'],
})
export class DocumentViewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DocumentViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentViewDialogData,
  ) {}

  get document(): ProviderDocument {
    return this.data.document;
  }

  get provider(): AccreditationProvider {
    return this.data.provider;
  }

  get isPending(): boolean {
    return this.document.status === 'Pending';
  }

  readonly statusOptions: Array<'Verified' | 'Pending' | 'Rejected' | 'Under Review'> = [
    'Verified',
    'Rejected',
    'Under Review',
    'Pending',
  ];

  get statusBadgeClass(): string {
    const s = this.document.status;
    if (s === 'Verified') return 'verified';
    if (s === 'Rejected') return 'rejected';
    if (s === 'Under Review') return 'under-review';
    return 'pending';
  }

  get statusIcon(): string {
    const s = this.document.status;
    if (s === 'Verified') return 'check_circle';
    if (s === 'Rejected') return 'cancel';
    if (s === 'Under Review') return 'schedule';
    return 'schedule';
  }

  get fileExt(): string {
    const name = this.document.filename || '';
    const i = name.lastIndexOf('.');
    return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
  }

  get isPdf(): boolean {
    return this.fileExt === 'pdf';
  }

  get isImage(): boolean {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(this.fileExt);
  }

  setStatus(status: 'Verified' | 'Pending' | 'Rejected' | 'Under Review'): void {
    this.document.status = status;
    const docs = this.provider.documents || [];
    this.provider.documentsVerified = docs.filter(d => d.status === 'Verified').length;
  }

  applyAndClose(): void {
    const docs = this.provider.documents || [];
    this.provider.documentsVerified = docs.filter(d => d.status === 'Verified').length;
    this.dialogRef.close({ updated: true });
  }

  close(): void {
    this.dialogRef.close();
  }
}
