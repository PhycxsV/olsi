import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate, CanMatch {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isAdmin) return true;
    return this.router.createUrlTree(['/dashboard']);
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    if (this.authService.isAdmin) return true;
    return this.router.createUrlTree(['/dashboard']);
  }
}
