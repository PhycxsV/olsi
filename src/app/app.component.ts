import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/bookings', label: 'Bookings', icon: 'collections_bookmark' },
    { path: '/clients', label: 'Clients', icon: 'people' },
    { path: '/providers', label: 'Providers', icon: 'local_shipping' },
    { path: '/accreditation', label: 'Accreditation', icon: 'verified' },
    { path: '/history', label: 'History', icon: 'history' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];
  mobileDrawerOpen = false;
}
