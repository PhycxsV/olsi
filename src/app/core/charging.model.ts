/**
 * Charging DB (Phase 1) – frontend mock. How OLSI charges clients.
 * Backend TBD; formulas will be revisited.
 */
export type ChargingTypeId = 'per_distance' | 'ad_valorem' | 'fixed_rate' | 'per_trip' | 'per_transaction' | 'fix_plus_per_hour';

export interface ChargingType {
  id: ChargingTypeId;
  label: string;
  description: string;
  phase?: 1 | 2; // phase 1 = implemented in UI
}

/** Phase 1: Per distance = fixed rate for first 5km + (excess km × multiplier) */
export interface PerDistanceRule {
  baseKm: number;
  baseRatePhp: number;
  excessMultiplierPhpPerKm: number;
}

/** Phase 1: Ad valorem = Sales Invoice × multiplier */
export interface AdValoremRule {
  multiplier: number; // e.g. 0.02 = 2%
}

export const CHARGING_TYPES: ChargingType[] = [
  { id: 'per_distance', label: 'Per Distance', description: 'Fixed rate for first 5km + multiplier for excess km', phase: 1 },
  { id: 'ad_valorem', label: 'Ad Valorem', description: 'Sales Invoice × multiplier', phase: 1 },
  { id: 'fixed_rate', label: 'Fixed Rate', description: 'Fixed rate (e.g. 5km flat)', phase: 2 },
  { id: 'per_trip', label: 'Per Trip', description: 'Point A to 1–4 drop-off points; number of points fixed in DB', phase: 2 },
  { id: 'per_transaction', label: 'Per Transaction', description: 'TBD – OLSI to confirm', phase: 2 },
  { id: 'fix_plus_per_hour', label: 'Fix + Per Hour', description: 'TBD', phase: 2 },
];

/** Mock charging rules (Phase 1). Would come from Charging DB. */
export const CHARGING_RULES = {
  per_distance: {
    baseKm: 5,
    baseRatePhp: 80,
    excessMultiplierPhpPerKm: 12,
  } as PerDistanceRule,
  ad_valorem: {
    multiplier: 0.02, // 2%
  } as AdValoremRule,
};

/**
 * Calculate cost (mock) for phase 1 charging types.
 * Requires distance in km for per_distance; salesInvoiceValue for ad_valorem.
 */
export function calculateCost(
  chargingTypeId: ChargingTypeId,
  options: { distanceKm?: number; salesInvoiceValue?: number }
): number | null {
  if (chargingTypeId === 'per_distance' && options.distanceKm != null) {
    const r = CHARGING_RULES.per_distance;
    if (options.distanceKm <= r.baseKm) return r.baseRatePhp;
    const excess = options.distanceKm - r.baseKm;
    return r.baseRatePhp + excess * r.excessMultiplierPhpPerKm;
  }
  if (chargingTypeId === 'ad_valorem' && options.salesInvoiceValue != null) {
    const r = CHARGING_RULES.ad_valorem;
    return options.salesInvoiceValue * r.multiplier;
  }
  return null;
}
