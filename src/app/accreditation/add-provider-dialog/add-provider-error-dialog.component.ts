import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AddProviderErrorDialogData {
  message: string;
}

@Component({
  selector: 'app-add-provider-error-dialog',
  templateUrl: './add-provider-error-dialog.component.html',
  styleUrls: ['./add-provider-error-dialog.component.scss'],
})
export class AddProviderErrorDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<AddProviderErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddProviderErrorDialogData,
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
