import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderDocument } from '../../accreditation.component';

export interface ExpiryDateDialogData {
  document: ProviderDocument;
}

@Component({
  selector: 'app-expiry-date-dialog',
  templateUrl: './expiry-date-dialog.component.html',
  styleUrls: ['./expiry-date-dialog.component.scss'],
})
export class ExpiryDateDialogComponent {
  selectedDate: Date | null;

  constructor(
    public dialogRef: MatDialogRef<ExpiryDateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExpiryDateDialogData,
  ) {
    this.selectedDate = this.getInitialDate();
  }

  private getInitialDate(): Date | null {
    const doc = this.data.document;
    if (!doc.expiryDate) return null;
    const d = new Date(doc.expiryDate);
    return isNaN(d.getTime()) ? null : d;
  }

  get document(): ProviderDocument {
    return this.data.document;
  }

  apply(): void {
    if (this.selectedDate) {
      const y = this.selectedDate.getFullYear();
      const m = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.selectedDate.getDate()).padStart(2, '0');
      this.document.expiryDate = `${y}-${m}-${day}T23:59`;
    } else {
      this.document.expiryDate = undefined;
    }
    this.dialogRef.close(this.document);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  clear(): void {
    this.selectedDate = null;
  }
}
