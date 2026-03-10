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

  verify(): void {
    this.document.status = 'Verified';
    const docs = this.provider.documents || [];
    this.provider.documentsVerified = docs.filter(d => d.status === 'Verified').length;
    this.dialogRef.close({ verified: true });
  }

  close(): void {
    this.dialogRef.close();
  }
}
