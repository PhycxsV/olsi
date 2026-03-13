import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ProviderBillingSettings {
  autoDeductProviderSystemFee: boolean;
  providerSystemFeePercent: number;
}

const DEFAULT_PROVIDER_BILLING_SETTINGS: ProviderBillingSettings = {
  autoDeductProviderSystemFee: false,
  providerSystemFeePercent: 5,
};

@Injectable({ providedIn: 'root' })
export class PlatformSettingsService {
  private readonly storageKey = 'olsi.platformSettings.providerBilling';
  private readonly providerBillingSettingsSubject = new BehaviorSubject<ProviderBillingSettings>(
    this.loadProviderBillingSettings(),
  );

  readonly providerBillingSettings$ = this.providerBillingSettingsSubject.asObservable();

  getProviderBillingSettings(): ProviderBillingSettings {
    return this.providerBillingSettingsSubject.value;
  }

  updateProviderBillingSettings(settings: Partial<ProviderBillingSettings>): void {
    const nextSettings: ProviderBillingSettings = {
      ...this.providerBillingSettingsSubject.value,
      ...settings,
    };

    this.providerBillingSettingsSubject.next(nextSettings);
    this.persistProviderBillingSettings(nextSettings);
  }

  private loadProviderBillingSettings(): ProviderBillingSettings {
    if (typeof localStorage === 'undefined') {
      return { ...DEFAULT_PROVIDER_BILLING_SETTINGS };
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return { ...DEFAULT_PROVIDER_BILLING_SETTINGS };
      }

      const parsed = JSON.parse(raw) as Partial<ProviderBillingSettings>;
      return {
        autoDeductProviderSystemFee:
          typeof parsed.autoDeductProviderSystemFee === 'boolean'
            ? parsed.autoDeductProviderSystemFee
            : DEFAULT_PROVIDER_BILLING_SETTINGS.autoDeductProviderSystemFee,
        providerSystemFeePercent:
          typeof parsed.providerSystemFeePercent === 'number'
            ? parsed.providerSystemFeePercent
            : DEFAULT_PROVIDER_BILLING_SETTINGS.providerSystemFeePercent,
      };
    } catch {
      return { ...DEFAULT_PROVIDER_BILLING_SETTINGS };
    }
  }

  private persistProviderBillingSettings(settings: ProviderBillingSettings): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(settings));
  }
}
