/**
 * Vehicle/Equipment requirements – client choice filters providers.
 * Only providers who can cater the selected vehicle type receive bookings.
 */
export interface VehicleType {
  id: string;
  label: string;
}

export const VEHICLE_TYPES: VehicleType[] = [
  { id: 'motorcycle', label: 'Motorcycle' },
  { id: 'van', label: 'Van' },
  { id: '6-wheeler', label: '6-Wheeler' },
  { id: 'truck', label: 'Truck' },
];
