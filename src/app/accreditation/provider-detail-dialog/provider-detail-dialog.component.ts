import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccreditationProvider, AccreditationStatus, ProviderDocument } from '../accreditation.component';

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

  onEdit(): void {
    console.log('Edit provider', this.provider);
  }

  viewDocument(doc: ProviderDocument): void {
    console.log('View document', doc);
  }

  onDocAction(doc: ProviderDocument, action: 'accept' | 'reject' | 'reupload'): void {
    console.log('Document screening (backend TBD)', action, doc);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
