import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ClientSupplierRider } from '../../clients/client.service';
import {
  DateRange,
  DeliveryHistoryService,
  HistoryRow,
} from '../../core/services/delivery-history.service';
import {
  PlatformSettingsService,
  ProviderBillingSettings,
} from '../../core/services/platform-settings.service';
import {
  ProviderBillingPeriodKey,
  ProviderBillingPeriodType,
  ProviderBillingService,
} from '../../core/services/provider-billing.service';
import { ProviderCard } from '../providers.component';

export interface ProviderDetailDialogData {
  provider: ProviderCard;
  riders: ClientSupplierRider[];
}

@Component({
  selector: 'app-provider-detail-dialog',
  templateUrl: './provider-detail-dialog.component.html',
  styleUrls: ['./provider-detail-dialog.component.scss'],
})
export class ProviderDetailDialogComponent implements OnInit, OnDestroy {
  periodType: ProviderBillingPeriodType = 'monthly';
  monthlyRanges: Array<{ value: string; label: string; range: DateRange }> = [];
  selectedMonthValue = '';
  biweeklyStartDate!: Date;
  biweeklyEndDate!: Date;
  completedDeliveries: HistoryRow[] = [];
  salesInvoiceTotal = 0;
  billingSettings!: ProviderBillingSettings;

  private settingsSubscription?: Subscription;

  constructor(
    public dialogRef: MatDialogRef<ProviderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProviderDetailDialogData,
    private deliveryHistoryService: DeliveryHistoryService,
    private platformSettingsService: PlatformSettingsService,
    private providerBillingService: ProviderBillingService,
  ) {}

  ngOnInit(): void {
    this.billingSettings = this.platformSettingsService.getProviderBillingSettings();
    this.monthlyRanges = this.buildMonthlyRanges();
    this.selectedMonthValue = this.monthlyRanges[0]?.value ?? this.buildMonthValue(new Date());
    this.setBiweeklyRangeFromEnd(this.endOfDay(new Date()));
    this.syncBillingState();

    this.settingsSubscription = this.platformSettingsService.providerBillingSettings$.subscribe(settings => {
      this.billingSettings = settings;
    });
  }

  ngOnDestroy(): void {
    this.settingsSubscription?.unsubscribe();
  }

  close(): void {
    this.dialogRef.close();
  }

  editProvider(): void {
    this.dialogRef.close({ action: 'edit' });
  }

  getInitial(name: string): string {
    return (name || 'P').charAt(0).toUpperCase();
  }

  get completedDeliveryCount(): number {
    return this.completedDeliveries.length;
  }

  get computedDeliveryTotal(): number {
    return this.deliveryHistoryService.sumAmounts(this.completedDeliveries);
  }

  get computedDeliveryTotalText(): string {
    return this.formatCurrency(this.computedDeliveryTotal);
  }

  get systemFeePercent(): number {
    return this.billingSettings.providerSystemFeePercent;
  }

  get systemFeeAmount(): number {
    return this.salesInvoiceTotal * (this.systemFeePercent / 100);
  }

  get systemFeeAmountText(): string {
    return this.formatCurrency(this.systemFeeAmount);
  }

  get netAfterFee(): number {
    return this.salesInvoiceTotal - this.systemFeeAmount;
  }

  get netAfterFeeText(): string {
    return this.formatCurrency(this.netAfterFee);
  }

  get salesInvoiceTotalText(): string {
    return this.formatCurrency(this.salesInvoiceTotal);
  }

  get variance(): number {
    return this.salesInvoiceTotal - this.computedDeliveryTotal;
  }

  get varianceText(): string {
    const prefix = this.variance > 0 ? '+' : '';
    return `${prefix}${this.formatCurrency(this.variance)}`;
  }

  get varianceLabel(): string {
    if (this.variance > 0) {
      return 'Provider SI is above computed completed deliveries.';
    }
    if (this.variance < 0) {
      return 'Provider SI is below computed completed deliveries.';
    }
    return 'Provider SI matches computed completed deliveries.';
  }

  get primaryDisplayedTotalText(): string {
    return this.formatCurrency(
      this.billingSettings.autoDeductProviderSystemFee ? this.netAfterFee : this.salesInvoiceTotal,
    );
  }

  get primaryDisplayedTotalLabel(): string {
    return this.billingSettings.autoDeductProviderSystemFee
      ? 'Provider SI minus IT/System fee (net amount)'
      : 'Provider Sales Invoice total (gross, before fee)';
  }

  get currentRangeLabel(): string {
    if (this.periodType === 'monthly') {
      return this.selectedMonthOption?.label ?? 'Current month';
    }

    return this.formatRangeLabel(this.currentRange);
  }

  get maxBiweeklyStartDate(): Date {
    const maxStartDate = this.startOfDay(new Date());
    maxStartDate.setDate(maxStartDate.getDate() - 13);
    return maxStartDate;
  }

  get maxBiweeklyEndDate(): Date {
    return this.endOfDay(new Date());
  }

  onPeriodTypeChange(): void {
    this.syncBillingState();
  }

  onMonthChange(): void {
    this.syncBillingState();
  }

  onBiweeklyStartDateChange(value: Date | null): void {
    if (!value) {
      return;
    }

    const normalizedStartDate = this.startOfDay(value);
    const maxStartDate = this.maxBiweeklyStartDate;
    this.setBiweeklyRangeFromStart(
      normalizedStartDate.getTime() > maxStartDate.getTime() ? maxStartDate : normalizedStartDate,
    );
    this.syncBillingState();
  }

  onBiweeklyEndDateChange(value: Date | null): void {
    if (!value) {
      return;
    }

    const normalizedEndDate = this.endOfDay(value);
    const maxEndDate = this.maxBiweeklyEndDate;
    this.setBiweeklyRangeFromEnd(
      normalizedEndDate.getTime() > maxEndDate.getTime() ? maxEndDate : normalizedEndDate,
    );
    this.syncBillingState();
  }

  onSalesInvoiceTotalChange(value: number | string): void {
    const numericValue = typeof value === 'number' ? value : Number(value);
    this.salesInvoiceTotal = Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
    this.providerBillingService.setSalesInvoiceTotal(this.currentBillingKey, this.salesInvoiceTotal);
  }

  private syncBillingState(): void {
    this.completedDeliveries = this.deliveryHistoryService.getCompletedDeliveriesForProvider(
      this.data.provider.name,
      this.currentRange,
    );
    this.salesInvoiceTotal = this.providerBillingService.getSalesInvoiceTotal(this.currentBillingKey);
  }

  private get currentRange(): DateRange {
    if (this.periodType === 'monthly') {
      return this.selectedMonthOption?.range ?? this.buildCurrentMonthRange();
    }

    return {
      start: this.startOfDay(new Date(this.biweeklyStartDate)),
      end: this.endOfDay(new Date(this.biweeklyEndDate)),
    };
  }

  private get currentBillingKey(): ProviderBillingPeriodKey {
    const range = this.currentRange;
    return {
      providerId: this.data.provider.id,
      periodType: this.periodType,
      rangeStartIso: range.start.toISOString(),
      rangeEndIso: range.end.toISOString(),
    };
  }

  private get selectedMonthOption(): { value: string; label: string; range: DateRange } | undefined {
    return this.monthlyRanges.find(option => option.value === this.selectedMonthValue);
  }

  private buildMonthlyRanges(): Array<{ value: string; label: string; range: DateRange }> {
    const providerDeliveries = this.deliveryHistoryService.getCompletedDeliveriesForProvider(this.data.provider.name);
    const ranges = new Map<string, { value: string; label: string; range: DateRange }>();

    providerDeliveries.forEach(record => {
      if (!record.completedAt) {
        return;
      }

      const completedAt = new Date(record.completedAt);
      const range = {
        start: new Date(completedAt.getFullYear(), completedAt.getMonth(), 1, 0, 0, 0, 0),
        end: new Date(completedAt.getFullYear(), completedAt.getMonth() + 1, 0, 23, 59, 59, 999),
      };
      const value = this.buildMonthValue(completedAt);

      if (!ranges.has(value)) {
        ranges.set(value, {
          value,
          label: this.formatMonthLabel(completedAt),
          range,
        });
      }
    });

    if (!ranges.size) {
      const currentDate = new Date();
      ranges.set(this.buildMonthValue(currentDate), {
        value: this.buildMonthValue(currentDate),
        label: this.formatMonthLabel(currentDate),
        range: this.buildCurrentMonthRange(),
      });
    }

    return [...ranges.values()].sort((a, b) => b.range.start.getTime() - a.range.start.getTime());
  }

  private buildCurrentMonthRange(): DateRange {
    const currentDate = new Date();
    return {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }

  private buildMonthValue(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private formatMonthLabel(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private formatRangeLabel(range: DateRange): string {
    const startText = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(range.start);
    const endText = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(range.end);

    return `${startText} - ${endText}`;
  }

  private formatCurrency(amount: number): string {
    return this.deliveryHistoryService.formatCurrency(amount);
  }

  private setBiweeklyRangeFromStart(startDate: Date): void {
    const nextStartDate = this.startOfDay(startDate);
    const nextEndDate = this.endOfDay(new Date(nextStartDate));
    nextEndDate.setDate(nextEndDate.getDate() + 13);

    if (nextEndDate.getTime() > this.maxBiweeklyEndDate.getTime()) {
      this.setBiweeklyRangeFromEnd(this.maxBiweeklyEndDate);
      return;
    }

    this.biweeklyStartDate = nextStartDate;
    this.biweeklyEndDate = nextEndDate;
  }

  private setBiweeklyRangeFromEnd(endDate: Date): void {
    const nextEndDate = this.endOfDay(endDate);
    const nextStartDate = this.startOfDay(new Date(nextEndDate));
    nextStartDate.setDate(nextStartDate.getDate() - 13);

    this.biweeklyStartDate = nextStartDate;
    this.biweeklyEndDate = nextEndDate;
  }

  private startOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private endOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(23, 59, 59, 999);
    return next;
  }
}
