import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AccreditationRoutingModule } from './accreditation-routing.module';
import { AccreditationComponent } from './accreditation.component';
import { ProviderDetailDialogComponent } from './provider-detail-dialog/provider-detail-dialog.component';

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

@NgModule({
  declarations: [AccreditationComponent, ProviderDetailDialogComponent],
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
  ],
})
export class AccreditationModule {}
