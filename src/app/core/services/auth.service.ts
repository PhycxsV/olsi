import { Injectable } from '@angular/core';

export type AppRole = 'ADMIN' | 'USER';

export interface AuthUser {
  email: string;
  role: AppRole;
  fullName: string;
}

interface MockAccount extends AuthUser {
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'olsi_auth_user';
  private readonly accounts: MockAccount[] = [
    { email: 'admin@test.com', password: 'admin123', role: 'ADMIN', fullName: 'Admin User' },
    { email: 'non-admin@test.com', password: 'user123', role: 'USER', fullName: 'Standard User' },
  ];
  private currentUserValue: AuthUser | null = null;

  constructor() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return;
    try {
      this.currentUserValue = JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(this.storageKey);
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

  login(email: string, password: string): { ok: boolean; message?: string } {
    const normalizedEmail = email.trim().toLowerCase();
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
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    return { ok: true };
  }

  logout(): void {
    this.currentUserValue = null;
    localStorage.removeItem(this.storageKey);
  }
}
