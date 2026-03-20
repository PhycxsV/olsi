import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
  { path: 'dashboard', canMatch: [AuthGuard], loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'bookings', canMatch: [AuthGuard], loadChildren: () => import('./bookings/bookings.module').then(m => m.BookingsModule) },
  { path: 'clients', canMatch: [AuthGuard], loadChildren: () => import('./clients/clients.module').then(m => m.ClientsModule) },
  { path: 'providers', canMatch: [AuthGuard], loadChildren: () => import('./providers/providers.module').then(m => m.ProvidersModule) },
  { path: 'accreditation', canMatch: [AuthGuard], loadChildren: () => import('./accreditation/accreditation.module').then(m => m.AccreditationModule) },
  { path: 'history', canMatch: [AuthGuard], loadChildren: () => import('./history/history.module').then(m => m.HistoryModule) },
  { path: 'settings', canMatch: [AuthGuard], loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule) },
  { path: 'users', canMatch: [AdminGuard], loadChildren: () => import('./users/users.module').then(m => m.UsersModule) },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
