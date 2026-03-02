import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BookingsRoutingModule } from './bookings-routing.module';
import { BookingsComponent } from './bookings.component';
import { CreateBookingDialogComponent } from './create-booking-dialog/create-booking-dialog.component';
import { BookingDetailDialogComponent } from './booking-detail-dialog/booking-detail-dialog.component';
import { AssignProviderDialogComponent } from './assign-provider-dialog/assign-provider-dialog.component';
import { BookingIntakePanelComponent } from './booking-intake-panel/booking-intake-panel.component';
import { Tier1PriorityPushComponent } from './tier1-priority-push/tier1-priority-push.component';
import { Tier2GeneralBroadcastComponent } from './tier2-general-broadcast/tier2-general-broadcast.component';
import { BookingPriorityFlowDialogComponent } from './booking-priority-flow-dialog/booking-priority-flow-dialog.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    BookingsComponent,
    CreateBookingDialogComponent,
    BookingDetailDialogComponent,
    AssignProviderDialogComponent,
    BookingIntakePanelComponent,
    Tier1PriorityPushComponent,
    Tier2GeneralBroadcastComponent,
    BookingPriorityFlowDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BookingsRoutingModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatMenuModule,
  ],
})
export class BookingsModule {}
