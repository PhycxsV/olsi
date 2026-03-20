import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/bookings', label: 'Bookings', icon: 'collections_bookmark' },
    { path: '/clients', label: 'Clients', icon: 'people' },
    { path: '/providers', label: 'Providers', icon: 'local_shipping' },
    { path: '/accreditation', label: 'Accreditation', icon: 'verified' },
    { path: '/users', label: 'Users', icon: 'manage_accounts', adminOnly: true },
    { path: '/history', label: 'History', icon: 'history' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];
  mobileDrawerOpen = false;
  currentUrl = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter((evt): evt is NavigationEnd => evt instanceof NavigationEnd))
      .subscribe(evt => {
        this.currentUrl = evt.urlAfterRedirects;
      });
  }

  get isLoginRoute(): boolean {
    return this.currentUrl.startsWith('/login');
  }

  get visibleNavItems(): NavItem[] {
    return this.navItems.filter(item => !item.adminOnly || this.authService.isAdmin);
  }

  get currentUserLabel(): string {
    const user = this.authService.currentUser;
    if (!user) return 'Guest';
    return `${user.fullName} (${user.role})`;
  }

  logout(): void {
    this.mobileDrawerOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
