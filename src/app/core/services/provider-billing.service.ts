import { Injectable } from '@angular/core';

export type ProviderBillingPeriodType = 'monthly' | 'biweekly';

export interface ProviderBillingPeriodKey {
  providerId: string;
  periodType: ProviderBillingPeriodType;
  rangeStartIso: string;
  rangeEndIso: string;
}

interface ProviderBillingRecord extends ProviderBillingPeriodKey {
  salesInvoiceTotal: number;
}

@Injectable({ providedIn: 'root' })
export class ProviderBillingService {
  private readonly storageKey = 'olsi.providerBilling.salesInvoices';

  getSalesInvoiceTotal(key: ProviderBillingPeriodKey): number {
    const match = this.loadRecords().find(record => this.isSameKey(record, key));
    return match?.salesInvoiceTotal ?? 0;
  }

  setSalesInvoiceTotal(key: ProviderBillingPeriodKey, salesInvoiceTotal: number): void {
    const records = this.loadRecords();
    const nextValue = Number.isFinite(salesInvoiceTotal) ? Math.max(0, salesInvoiceTotal) : 0;
    const existingIndex = records.findIndex(record => this.isSameKey(record, key));

    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], salesInvoiceTotal: nextValue };
    } else {
      records.push({ ...key, salesInvoiceTotal: nextValue });
    }

    this.persistRecords(records);
  }

  private loadRecords(): ProviderBillingRecord[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as ProviderBillingRecord[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(record =>
        typeof record?.providerId === 'string' &&
        (record?.periodType === 'monthly' || record?.periodType === 'biweekly') &&
        typeof record?.rangeStartIso === 'string' &&
        typeof record?.rangeEndIso === 'string' &&
        typeof record?.salesInvoiceTotal === 'number',
      );
    } catch {
      return [];
    }
  }

  private persistRecords(records: ProviderBillingRecord[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  private isSameKey(record: ProviderBillingPeriodKey, key: ProviderBillingPeriodKey): boolean {
    return (
      record.providerId === key.providerId &&
      record.periodType === key.periodType &&
      record.rangeStartIso === key.rangeStartIso &&
      record.rangeEndIso === key.rangeEndIso
    );
  }
}
