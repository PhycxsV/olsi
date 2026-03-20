import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanMatch {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isAuthenticated) return true;
    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: this.router.url || '/dashboard' },
    });
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    if (this.authService.isAuthenticated) return true;
    const attemptedPath = '/' + segments.map(s => s.path).join('/');
    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: attemptedPath || '/dashboard' },
    });
  }
}
