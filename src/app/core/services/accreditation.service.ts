import { Injectable } from '@angular/core';
import type { AccreditationProvider, DocumentExpiringSoon } from '../models/accreditation.model';

@Injectable({ providedIn: 'root' })
export class AccreditationService {
  private providers: AccreditationProvider[] = [];

  getProviders(): AccreditationProvider[] {
    return this.providers;
  }

  setProviders(providers: AccreditationProvider[]): void {
    this.providers = providers;
  }

  addProvider(provider: AccreditationProvider): void {
    this.providers = [...this.providers, provider];
  }

  /**
   * Returns documents that have an expiry date set and expire within the next `withinDays` days.
   * Used by the dashboard to show alerts when expiry is nearing.
   */
  getDocumentsExpiringSoon(withinDays: number): DocumentExpiringSoon[] {
    const result: DocumentExpiringSoon[] = [];
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + withinDays);
    for (const provider of this.providers) {
      const docs = provider.documents || [];
      for (const doc of docs) {
        const expiry = doc.expiryDate;
        if (!expiry || !expiry.trim()) continue;
        const expiryDate = new Date(expiry);
        if (isNaN(expiryDate.getTime())) continue;
        if (expiryDate > now && expiryDate <= cutoff) {
          const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          result.push({
            providerId: provider.id,
            providerName: provider.name,
            documentTitle: doc.title,
            filename: doc.filename,
            expiryDate: expiry,
            daysLeft,
          });
        }
      }
    }
    result.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    return result;
  }
}
