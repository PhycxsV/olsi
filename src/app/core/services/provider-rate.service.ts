import { Injectable } from '@angular/core';
import type { ProviderRateRow } from '../models/provider-rate.model';

@Injectable({ providedIn: 'root' })
export class ProviderRateService {
  private rates: ProviderRateRow[] = [];

  getRates(): ProviderRateRow[] {
    return this.rates;
  }

  replaceAll(rates: ProviderRateRow[]): void {
    this.rates = [...rates];
  }
}
