export type RideType = "standard" | "premium" | "xl";

export type RideStatus =
  | "requested"
  | "accepted"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Person {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  role?: string;
}

export interface Ride {
  id: string;
  rider_id: string;
  driver_id: string | null;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  distance_km: number | null;
  duration_min: number | null;
  vehicle_type: RideType;
  estimated_fare: number | string;
  base_fare?: number | string | null;
  platform_fee?: number | string | null;
  driver_earnings?: number | string | null;
  final_fare?: number | string | null;
  currency: string;
  status: RideStatus;
  payment_status: string;
  requested_at: string;
  accepted_at?: string | null;
  arrived_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  rider?: Person | null;
  driver?: Person | null;
  distance_to_pickup_km?: number | null;
}

export interface RideEvent {
  id: string;
  ride_id: string;
  status: RideStatus;
  note?: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  ride_id: string;
  rider_id: string;
  driver_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  rider?: Person | null;
}

export interface AppNotification {
  id: string;
  profile_id: string;
  ride_id?: string | null;
  title: string;
  body: string;
  type?: string | null;
  read_at?: string | null;
  created_at: string;
}

export interface DriverProfile {
  profile_id: string;
  license_number?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_plate?: string | null;
  vehicle_type?: RideType;
  is_online: boolean;
  is_verified: boolean;
  current_lat?: number | null;
  current_lng?: number | null;
  rating_avg: number | string;
  rating_count: number;
  total_trips?: number;
}

export interface Profile {
  id: string;
  clerk_user_id?: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: "rider" | "driver" | "admin";
}

export interface FareQuote {
  estimatedFare: number;
  baseFare: number;
  platformFee: number;
  driverEarnings: number;
  currency: string;
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  ride: Ride;
  fare?: FareQuote;
  route?: { distanceKm: number; durationMin: number; source: string };
  payment?: { orderId: string; amount: number; currency: string; keyId: string } | null;
  driversNotified?: number;
}
