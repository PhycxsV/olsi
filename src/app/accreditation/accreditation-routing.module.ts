import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccreditationComponent } from './accreditation.component';

const routes: Routes = [{ path: '', component: AccreditationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccreditationRoutingModule {}
