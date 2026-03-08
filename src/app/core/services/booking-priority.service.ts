import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import {
  BookingPriorityState,
  BookingIntakeResponse,
  Tier1Payload,
  Tier2Payload,
  SupplierResponse,
  SupplierResponseType,
} from '../models/booking-priority.model';

/** Configurable Tier 1 window in minutes (e.g. 3–5). */
const DEFAULT_TIER1_WINDOW_MINUTES = 4;
const RIDER_VISIBILITY_RADIUS_KM = 5;

interface GeoPoint {
  lat: number;
  lng: number;
}

interface MockRiderSeed {
  riderId: string;
  riderName: string;
  supplierId: string;
  supplierName: string;
  status: 'available' | 'busy' | 'offline';
  location: GeoPoint;
}

@Injectable({ providedIn: 'root' })
export class BookingPriorityService {
  private readonly state$ = new BehaviorSubject<BookingPriorityState | null>(null);
  private readonly intake$ = new BehaviorSubject<BookingIntakeResponse | null>(null);
  private readonly tier1$ = new BehaviorSubject<Tier1Payload | null>(null);
  private readonly tier2$ = new BehaviorSubject<Tier2Payload | null>(null);
  private readonly supplierResponses$ = new BehaviorSubject<SupplierResponse[]>([]);
  private tier1WindowMinutes = DEFAULT_TIER1_WINDOW_MINUTES;
  private countdownEndTime: number | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  getState(): Observable<BookingPriorityState | null> {
    return this.state$.asObservable();
  }

  getIntake(): Observable<BookingIntakeResponse | null> {
    return this.intake$.asObservable();
  }

  getTier1(): Observable<Tier1Payload | null> {
    return this.tier1$.asObservable();
  }

  getTier2(): Observable<Tier2Payload | null> {
    return this.tier2$.asObservable();
  }

  getSupplierResponses(): Observable<SupplierResponse[]> {
    return this.supplierResponses$.asObservable();
  }

  /** Configurable Tier 1 window (minutes). */
  setTier1WindowMinutes(minutes: number): void {
    this.tier1WindowMinutes = Math.max(1, Math.min(10, minutes));
  }

  getTier1WindowMinutes(): number {
    return this.tier1WindowMinutes;
  }

  /**
   * Mock POST /bookings with Account ID.
   * Returns intake: account mapping, geofence, active riders from preferred supplier.
   */
  submitBookingIntake(accountId: string, _payload?: unknown): Observable<BookingIntakeResponse> {
    const preferredSupplier = this.getPreferredSupplierForAccount(accountId);
    const bookerLocation = this.getBookerLocation(accountId);
    const riders = this.getMockRiders();
    const activeRidersFromPreferred = riders
      .filter(r => r.supplierId === preferredSupplier.id)
      .map(r => ({
        riderId: r.riderId,
        riderName: r.riderName,
        supplierId: r.supplierId,
        supplierName: r.supplierName,
        status: r.status,
        distanceToBookerKm: this.getDistanceKm(bookerLocation, r.location),
      }))
      .filter(r => r.status === 'available' && r.distanceToBookerKm <= RIDER_VISIBILITY_RADIUS_KM);

    const mock: BookingIntakeResponse = {
      bookingId: `BK-${Date.now().toString(36).toUpperCase()}`,
      accountMapping: {
        accountId,
        accountName: this.getAccountName(accountId),
        preferredSupplierId: preferredSupplier.id,
        preferredSupplierName: preferredSupplier.name,
      },
      geofence: {
        inGeofence: true,
        zoneName: 'Metro Manila',
        message: `Showing only riders from ${preferredSupplier.name} within ${RIDER_VISIBILITY_RADIUS_KM}km of the booker.`,
        radiusKm: RIDER_VISIBILITY_RADIUS_KM,
        bookerLocation,
      },
      activeRidersFromPreferred,
    };
    this.intake$.next(mock);
    this.state$.next('PENDING_PRIORITY_ACCEPTANCE');
    this.startTier1(mock);
    return of(mock);
  }

  private getAccountName(accountId: string): string {
    const names: Record<string, string> = {
      '1': 'FreshMart Philippines',
      '2': 'QuickEats Delivery',
      '4': 'TechStore PH',
      '6': 'GreenGrocers Co.',
    };
    return names[accountId] || `Account ${accountId}`;
  }

  private getPreferredSupplierForAccount(accountId: string): { id: string; name: string } {
    const map: Record<string, { id: string; name: string }> = {
      '1': { id: 'mf', name: 'MetroFleet' },
      '2': { id: 'sr', name: 'SpeedRiders' },
      '4': { id: 'sd', name: 'SwiftDeliver' },
      '6': { id: 'ew', name: 'Expressway' },
    };
    return map[accountId] || { id: 'mf', name: 'MetroFleet' };
  }

  private getBookerLocation(accountId: string): GeoPoint {
    const map: Record<string, GeoPoint> = {
      '1': { lat: 14.5547, lng: 121.0244 }, // Makati
      '2': { lat: 14.6091, lng: 121.0223 }, // Quezon City
      '4': { lat: 14.5176, lng: 121.0509 }, // BGC/Taguig
      '6': { lat: 14.5764, lng: 121.0851 }, // Pasig
    };
    return map[accountId] || { lat: 14.5547, lng: 121.0244 };
  }

  private getMockRiders(): MockRiderSeed[] {
    return [
      { riderId: 'r1', riderName: 'Juan D.', supplierId: 'mf', supplierName: 'MetroFleet', status: 'available', location: { lat: 14.5572, lng: 121.0195 } },
      { riderId: 'r2', riderName: 'Maria S.', supplierId: 'mf', supplierName: 'MetroFleet', status: 'busy', location: { lat: 14.5646, lng: 121.0286 } },
      { riderId: 'r3', riderName: 'Pedro L.', supplierId: 'mf', supplierName: 'MetroFleet', status: 'available', location: { lat: 14.6104, lng: 121.015 } },
      { riderId: 'r4', riderName: 'Ana C.', supplierId: 'sr', supplierName: 'SpeedRiders', status: 'available', location: { lat: 14.6112, lng: 121.0181 } },
      { riderId: 'r5', riderName: 'Mark T.', supplierId: 'sr', supplierName: 'SpeedRiders', status: 'available', location: { lat: 14.6502, lng: 121.0679 } },
      { riderId: 'r6', riderName: 'Lito R.', supplierId: 'sd', supplierName: 'SwiftDeliver', status: 'available', location: { lat: 14.5501, lng: 121.0463 } },
      { riderId: 'r7', riderName: 'Joan V.', supplierId: 'ew', supplierName: 'Expressway', status: 'available', location: { lat: 14.5825, lng: 121.0958 } },
    ];
  }

  private getDistanceKm(origin: GeoPoint, target: GeoPoint): number {
    const toRad = (deg: number): number => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(target.lat - origin.lat);
    const dLng = toRad(target.lng - origin.lng);
    const lat1 = toRad(origin.lat);
    const lat2 = toRad(target.lat);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((earthRadiusKm * c).toFixed(2));
  }

  private startTier1(intake: BookingIntakeResponse): void {
    const preferred = intake.accountMapping.preferredSupplierId && intake.accountMapping.preferredSupplierName
      ? { id: intake.accountMapping.preferredSupplierId, name: intake.accountMapping.preferredSupplierName }
      : { id: 'mf', name: 'MetroFleet' };
    const available = intake.activeRidersFromPreferred.filter(r => r.status === 'available');
    const notifiedRiderIds = available.map(r => r.riderId);
    const expiresAt = new Date(Date.now() + this.tier1WindowMinutes * 60 * 1000);
    this.countdownEndTime = expiresAt.getTime();

    const payload: Tier1Payload = {
      status: 'PENDING_PRIORITY_ACCEPTANCE',
      preferredSupplierId: preferred.id,
      preferredSupplierName: preferred.name,
      notifiedRiderIds,
      expiresAt,
      windowMinutes: this.tier1WindowMinutes,
      supplierResponses: [],
    };
    this.tier1$.next(payload);
    this.supplierResponses$.next([]);
    this.tier2$.next(null);
    this.startCountdown(expiresAt, payload);
  }

  private startCountdown(expiresAt: Date, payload: Tier1Payload): void {
    this.stopCountdown();
    const tick = (): void => {
      const now = Date.now();
      if (now >= expiresAt.getTime()) {
        this.stopCountdown();
        this.onTier1Timeout();
        return;
      }
      this.tier1$.next({ ...payload, expiresAt: new Date(expiresAt.getTime()) });
    };
    tick();
    this.countdownInterval = setInterval(tick, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countdownEndTime = null;
  }

  /** Seconds remaining until Tier 1 expiry (0 when expired or no timer). */
  getCountdownSeconds(): Observable<number> {
    return new Observable(sub => {
      const run = (): void => {
        if (this.countdownEndTime == null) {
          sub.next(0);
          return;
        }
        const sec = Math.max(0, Math.floor((this.countdownEndTime - Date.now()) / 1000));
        sub.next(sec);
      };
      run();
      const id = setInterval(run, 500);
      return () => clearInterval(id);
    });
  }

  /** Simulate accept: move to ASSIGNED. */
  acceptTier1(riderId: string, riderName: string): void {
    this.stopCountdown();
    const responses = [...this.supplierResponses$.value];
    responses.push({
      riderId,
      riderName,
      response: 'accept',
      at: new Date().toLocaleTimeString(),
    });
    this.supplierResponses$.next(responses);
    this.state$.next('ASSIGNED');
    this.tier1$.next({
      ...this.tier1$.value!,
      status: 'ASSIGNED',
      supplierResponses: responses,
    });
  }

  /** Simulate decline from a rider. */
  declineTier1(riderId: string, riderName: string): void {
    const responses = [...this.supplierResponses$.value];
    responses.push({
      riderId,
      riderName,
      response: 'decline',
      at: new Date().toLocaleTimeString(),
    });
    this.supplierResponses$.next(responses);
    this.tier1$.next({
      ...this.tier1$.value!,
      supplierResponses: responses,
    });
  }

  /** Tier 1 timeout or all declined → trigger Tier 2. */
  private onTier1Timeout(): void {
    const t1 = this.tier1$.value;
    const responses = [...(t1?.supplierResponses ?? [])];
    if (responses.every(r => r.response !== 'accept')) {
      responses.push({
        riderId: '—',
        riderName: 'System',
        response: 'timeout',
        at: new Date().toLocaleTimeString(),
      });
    }
    this.supplierResponses$.next(responses);
    this.state$.next('TIMEOUT');
    this.tier1$.next(t1 ? { ...t1, status: 'TIMEOUT', supplierResponses: responses } : null);
    this.startTier2();
  }

  /** Manually trigger Tier 2 (e.g. "All declined" button). */
  triggerTier2(): void {
    this.stopCountdown();
    this.onTier1Timeout();
  }

  private startTier2(): void {
    const payload: Tier2Payload = {
      status: 'BROADCAST',
      availableSupplierIds: ['sr', 'mf', 'sd', 'ew'],
      availableSuppliers: [
        { id: 'sr', name: 'SpeedRiders', ridersInArea: 12 },
        { id: 'mf', name: 'MetroFleet', ridersInArea: 8 },
        { id: 'sd', name: 'SwiftDeliver', ridersInArea: 6 },
        { id: 'ew', name: 'Expressway', ridersInArea: 4 },
      ],
      broadcastSentAt: new Date().toLocaleTimeString(),
    };
    this.tier2$.next(payload);
  }

  /** Assign from Tier 2 (broadcast). */
  assignFromTier2(supplierId: string, supplierName: string): void {
    this.state$.next('ASSIGNED_BROADCAST');
    this.tier2$.next({
      ...this.tier2$.value!,
      status: 'ASSIGNED_BROADCAST',
    });
  }

  /** Reset flow (e.g. when closing dialog). */
  reset(): void {
    this.stopCountdown();
    this.state$.next(null);
    this.intake$.next(null);
    this.tier1$.next(null);
    this.tier2$.next(null);
    this.supplierResponses$.next([]);
  }
}
