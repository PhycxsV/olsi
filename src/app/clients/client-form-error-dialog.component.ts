import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ClientFormErrorDialogData {
  message: string;
}

@Component({
  selector: 'app-client-form-error-dialog',
  template: `
    <h2 mat-dialog-title>Unable to save client</h2>
    <div mat-dialog-content>
      <pre class="client-error-message">{{ data.message }}</pre>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button type="button" (click)="close()">Close</button>
    </div>
  `,
  styles: [`
    .client-error-message {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: inherit;
    }
  `],
})
export class ClientFormErrorDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ClientFormErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientFormErrorDialogData,
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
