import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AccreditationRoutingModule } from './accreditation-routing.module';
import { AccreditationComponent } from './accreditation.component';
import { ProviderDetailDialogComponent } from './provider-detail-dialog/provider-detail-dialog.component';
import { ExpiryDateDialogComponent } from './provider-detail-dialog/expiry-date-dialog/expiry-date-dialog.component';
import { DocumentViewDialogComponent } from './provider-detail-dialog/document-view-dialog/document-view-dialog.component';
import { AddProviderDialogComponent } from './add-provider-dialog/add-provider-dialog.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [AccreditationComponent, ProviderDetailDialogComponent, ExpiryDateDialogComponent, DocumentViewDialogComponent, AddProviderDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    AccreditationRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDialogModule,
    MatTabsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class AccreditationModule {}
