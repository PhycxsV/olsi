import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CHARGING_RULES } from '../core/charging.model';
import { PlatformSettingsService } from '../core/services/platform-settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  settingsForm: FormGroup;

  /** Phase 1 charging rules (mock from Charging DB) */
  perDistanceRule = CHARGING_RULES.per_distance;
  adValoremRule = CHARGING_RULES.ad_valorem;

  constructor(
    private fb: FormBuilder,
    private platformSettingsService: PlatformSettingsService,
  ) {
    const providerBillingSettings = this.platformSettingsService.getProviderBillingSettings();

    this.settingsForm = this.fb.group({
      enableAutoDistribution: [true],
      firstComeFirstServed: [true],
      performanceBasedRouting: [false],
      offerTimeoutSeconds: [120],
      maxRetryAttempts: [3],
      unassignedBookingAlerts: [true],
      alertAfterMinutes: [15],
      slaWarningMinutes: [10],
      emailNotifications: [true],
      apiKey: ['************'],
      webhookUrl: ['https://your-system.com/webhooks'],
      // Charging (Phase 1) – mock editable, would sync to Charging DB
      perDistanceBaseKm: [CHARGING_RULES.per_distance.baseKm],
      perDistanceBaseRate: [CHARGING_RULES.per_distance.baseRatePhp],
      perDistanceExcessMultiplier: [CHARGING_RULES.per_distance.excessMultiplierPhpPerKm],
      adValoremMultiplier: [CHARGING_RULES.ad_valorem.multiplier],
      autoDeductProviderSystemFee: [providerBillingSettings.autoDeductProviderSystemFee],
      providerSystemFeePercent: [providerBillingSettings.providerSystemFeePercent],
    });
  }

  save(): void {
    this.platformSettingsService.updateProviderBillingSettings({
      autoDeductProviderSystemFee: !!this.settingsForm.get('autoDeductProviderSystemFee')?.value,
      providerSystemFeePercent: Number(this.settingsForm.get('providerSystemFeePercent')?.value) || 5,
    });
    console.log('Save settings', this.settingsForm.value);
  }
}
