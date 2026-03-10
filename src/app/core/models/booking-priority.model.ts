/**
 * Rider Booking Priority Flow – states and DTOs (aligned with Excel flow).
 */

/** Booking priority states in the waterfall. */
export type BookingPriorityState =
  | 'PENDING_PRIORITY_ACCEPTANCE'  // Tier 1: exclusive window
  | 'ASSIGNED'                      // Accepted by preferred supplier
  | 'TIMEOUT'                       // Tier 1 timed out or all declined → triggers Tier 2
  | 'BROADCAST'                     // Tier 2: open to all accredited providers
  | 'ASSIGNED_BROADCAST';           // Assigned from Tier 2

/** Supplier response in Tier 1. */
export type SupplierResponseType = 'accept' | 'decline' | 'timeout' | 'pending';

export interface AccountMapping {
  accountId: string;
  accountName: string;
  preferredSupplierId: string | null;
  preferredSupplierName: string | null;
}

export interface GeofenceStatus {
  inGeofence: boolean;
  zoneName: string | null;
  message: string;
  radiusKm: number;
  bookerLocation: { lat: number; lng: number };
}

export interface ActiveRider {
  riderId: string;
  riderName: string;
  supplierId: string;
  supplierName: string;
  status: 'available' | 'busy' | 'offline';
  distanceToBookerKm: number;
}

/** Response from mock POST /bookings (intake). */
export interface BookingIntakeResponse {
  bookingId: string;
  accountMapping: AccountMapping;
  geofence: GeofenceStatus;
  activeRidersFromPreferred: ActiveRider[];
}

/** Tier 1 exclusive window payload. */
export interface Tier1Payload {
  status: BookingPriorityState;
  preferredSupplierId: string;
  preferredSupplierName: string;
  notifiedRiderIds: string[];
  expiresAt: Date;
  /** Configurable window minutes (e.g. 3–5). */
  windowMinutes: number;
  supplierResponses: SupplierResponse[];
}

export interface SupplierResponse {
  riderId: string;
  riderName: string;
  response: SupplierResponseType;
  at: string;
}

/** Tier 2 broadcast payload. */
export interface Tier2Payload {
  status: BookingPriorityState;
  availableSupplierIds: string[];
  availableSuppliers: { id: string; name: string; ridersInArea: number; slaPercent: number }[];
  broadcastSentAt: string;
  /** Set when auto-assigned by highest SLA. */
  assignedSupplierId?: string;
  assignedSupplierName?: string;
  assignedSlaPercent?: number;
}
