import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProvidersRoutingModule } from './providers-routing.module';
import { ProvidersComponent } from './providers.component';
import { ProviderFormDialogComponent } from './provider-form-dialog.component';
import { ProviderDetailDialogComponent } from './provider-detail-dialog/provider-detail-dialog.component';

import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [ProvidersComponent, ProviderFormDialogComponent, ProviderDetailDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ProvidersRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDialogModule,
  ],
})
export class ProvidersModule {}
