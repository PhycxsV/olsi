import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AccreditationProvider, AccreditationStatus } from '../models/accreditation.model';
import {
  buildCreateProviderFormData,
  mapAccreditationProvider,
  mapAccreditedToProviderCard,
  toApiProviderStatus,
} from './keri-mapper';
import { unwrapApiArray } from './keri-unwrap';
import type { AddProviderDraft } from '../../accreditation/add-provider-dialog/add-provider-dialog.component';
import type { ProviderCard } from '../../providers/provider.service';

@Injectable({ providedIn: 'root' })
export class KeriProvidersApiService {
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

  getAllProviders(): Observable<AccreditationProvider[]> {
    return this.http.get<unknown>(`${this.apiRoot()}/api/providers`).pipe(
      map(payload =>
        unwrapApiArray(payload)
          .map(mapAccreditationProvider)
          .filter((x): x is AccreditationProvider => !!x),
      ),
    );
  }

  getProviderByDocumentId(documentId: string): Observable<AccreditationProvider | null> {
    return this.http.get<unknown>(`${this.apiRoot()}/api/providers/${encodeURIComponent(documentId)}`).pipe(
      map(raw => mapAccreditationProvider(raw)),
    );
  }

  createProvider(draft: AddProviderDraft): Observable<unknown> {
    const body = buildCreateProviderFormData(draft);
    return this.http.post(`${this.apiRoot()}/api/providers`, body);
  }

  /**
   * Accreditation edit: PUT only `provider_status` (other form fields are not persisted on update).
   */
  updateProvider(documentId: string, status: any): Observable<unknown> {
    return this.http.put(`${this.apiRoot()}/api/providers/${encodeURIComponent(documentId)}`, {
      data: { provider_status: status },
    });
  }

  /**
   * Providers (operations) edit: PUT only `is_active` (Active/Paused — other form fields are not persisted on update).
   */
  updateProviderOperational(documentId: string, isActive: boolean): Observable<unknown> {
    return this.http.put(`${this.apiRoot()}/api/providers/${encodeURIComponent(documentId)}`, {
      data: { is_active: isActive },
    });
  }

  getAccreditedProviders(): Observable<ProviderCard[]> {
    return this.http.get<unknown>(`${this.apiRoot()}/api/provider/accredited`).pipe(
      map(payload =>
        unwrapApiArray(payload)
          .map(mapAccreditedToProviderCard)
          .filter((x): x is ProviderCard => !!x),
      ),
    );
  }

  toggleProviderActive(providerDocumentId: string, isActive: boolean): Observable<unknown> {
    return this.http.put(`${this.apiRoot()}/api/provider/toggle-active`, {
      provider_document_id: providerDocumentId,
      is_active: isActive,
    });
  }

  uploadProviderDocument(params: {
    providerId: string;
    providerDocumentId: string;
    expiryDate: string;
    file: File;
  }): Observable<unknown> {
    const fd = new FormData();
    fd.append('provider_id', params.providerId);
    fd.append('provider_document_id', params.providerDocumentId);
    fd.append('expiry_date', params.expiryDate);
    fd.append('files', params.file, params.file.name);
    return this.http.post(`${this.apiRoot()}/api/provider-documents/upload`, fd);
  }

  verifyProviderDocument(providerDocumentId: string): Observable<unknown> {
    const fd = new FormData();
    fd.append('provider_document_id', providerDocumentId);
    return this.http.put(`${this.apiRoot()}/api/provider-documents/verify`, fd);
  }

  updateProviderDocumentExpiry(providerDocumentId: string, expiryDate: string): Observable<unknown> {
    const fd = new FormData();
    fd.append('provider_document_id', providerDocumentId);
    fd.append('expiry_date', expiryDate);
    return this.http.put(`${this.apiRoot()}/api/provider-documents/expiry-date-update`, fd);
  }

  updateProviderDetails(documentId: any, payload: any){
    return this.http.put(`${this.apiRoot()}/api/providers/${documentId}`, payload);
  }
}
