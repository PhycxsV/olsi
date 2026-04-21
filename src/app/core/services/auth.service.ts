import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export type AppRole = 'ADMIN' | 'USER';

export interface AuthUser {
  email: string;
  role: AppRole;
  fullName: string;
}

interface MockAccount extends AuthUser {
  password: string;
}

interface RemoteLoginResponse {
  jwt?: string;
  token?: string;
  access_token?: string;
  user?: {
    email?: string;
    username?: string;
    role?: { name?: string } | string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKeyUser = 'olsi_auth_user';
  private readonly storageKeyJwt = 'olsi_auth_jwt';
  private readonly accounts: MockAccount[] = [
    { email: 'admin@test.com', password: 'admin123', role: 'ADMIN', fullName: 'Admin User' },
    { email: 'non-admin@test.com', password: 'user123', role: 'USER', fullName: 'Standard User' },
  ];
  private currentUserValue: AuthUser | null = null;

  constructor(private http: HttpClient) {
    const raw = localStorage.getItem(this.storageKeyUser);
    const jwt = localStorage.getItem(this.storageKeyJwt);
    if (!raw) return;
    if (environment.apiUrl?.trim() && !jwt) {
      localStorage.removeItem(this.storageKeyUser);
      return;
    }
    try {
      this.currentUserValue = JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(this.storageKeyUser);
      localStorage.removeItem(this.storageKeyJwt);
      this.currentUserValue = null;
    }
  }

  get currentUser(): AuthUser | null {
    return this.currentUserValue;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  get isAdmin(): boolean {
    return this.currentUserValue?.role === 'ADMIN';
  }

  /** Bearer token for KERI API (set after remote login). */
  getAccessToken(): string | null {
    return localStorage.getItem(this.storageKeyJwt);
  }

  /**
   * When `environment.apiUrl` is set, calls POST /api/auth/local.
   * Otherwise uses built-in mock accounts (no HTTP).
   */
  login(email: string, password: string): Observable<{ ok: boolean; message?: string }> {
    const trimmed = email.trim();
    if (!environment.apiUrl?.trim()) {
      return of(this.mockLoginSync(trimmed, password));
    }
    const root = environment.apiUrl.replace(/\/$/, '');
    return this.http
      .post<RemoteLoginResponse>(`${root}/api/auth/local`, {
        identifier: trimmed,
        password,
      })
      .pipe(
        map(res => {
          const jwt = res.jwt ?? res.token ?? res.access_token;
          if (!jwt) {
            return { ok: false, message: 'Login response did not include a token.' };
          }
          const u = res.user;
          const emailOut = (u?.email || trimmed).toLowerCase();
          const fullName =
            typeof u?.username === 'string' && u.username.trim()
              ? u.username.trim()
              : emailOut.split('@')[0] || 'User';
          const authUser: AuthUser = {
            email: emailOut,
            role: this.mapRemoteRole(u?.role),
            fullName,
          };
          this.currentUserValue = authUser;
          localStorage.setItem(this.storageKeyUser, JSON.stringify(authUser));
          localStorage.setItem(this.storageKeyJwt, jwt);
          return { ok: true };
        }),
        catchError(err => {
          const body = err?.error;
          const msg =
            body?.error?.message ||
            body?.message ||
            (Array.isArray(body?.message) ? body.message[0]?.message : undefined) ||
            err?.message ||
            'Login failed.';
          return of({ ok: false, message: typeof msg === 'string' ? msg : 'Login failed.' });
        }),
      );
  }

  logout(): void {
    this.currentUserValue = null;
    localStorage.removeItem(this.storageKeyUser);
    localStorage.removeItem(this.storageKeyJwt);
  }

  private mockLoginSync(email: string, password: string): { ok: boolean; message?: string } {
    const normalizedEmail = email.toLowerCase();
    const account = this.accounts.find(a => a.email === normalizedEmail);
    if (!account || account.password !== password) {
      return { ok: false, message: 'Invalid email or password.' };
    }
    const user: AuthUser = {
      email: account.email,
      role: account.role,
      fullName: account.fullName,
    };
    this.currentUserValue = user;
    localStorage.setItem(this.storageKeyUser, JSON.stringify(user));
    return { ok: true };
  }

  private mapRemoteRole(role: { name?: string } | string | undefined): AppRole {
    if (role === undefined || role === null) return 'ADMIN';
    const s = typeof role === 'string' ? role : role?.name;
    if (!s) return 'ADMIN';
    return s.toUpperCase().includes('ADMIN') ? 'ADMIN' : 'USER';
  }
}
