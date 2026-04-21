import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ClientRow } from '../../clients/clients.component';
import { mapClientRow } from './keri-mapper';
import { unwrapApiArray } from './keri-unwrap';

@Injectable({ providedIn: 'root' })
export class KeriClientsApiService {
  constructor(private http: HttpClient) {}

  private apiRoot(): string {
    const u = environment.apiUrl?.trim();
    if (!u) {
      throw new Error('environment.apiUrl is empty');
    }
    return u.replace(/\/$/, '');
  }

  isConfigured(): boolean {
    return !!environment.apiUrl?.trim();
  }

  getAllClients(): Observable<ClientRow[]> {
    return this.http
      .get<unknown>(`${this.apiRoot()}/api/clients?populate=vehicles,charging_types,providers,bookings`)
      .pipe(
        map(payload =>
          unwrapApiArray(payload)
            .map(mapClientRow)
            .filter((x): x is ClientRow => !!x),
        ),
      );
  }
}
