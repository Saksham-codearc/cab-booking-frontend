const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type RideType = "standard" | "premium" | "xl";

export interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  vehicle_type: string;
  estimated_fare: number | string;
  currency: string;
  status: string;
  requested_at: string;
}

export interface TripEstimate {
  distanceKm: number;
  durationMin: number;
  currency: string;
  source: "google" | "heuristic";
  fares: Record<RideType, number>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Authenticated JSON fetch that surfaces the backend's message on failure. */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, token }: ApiFetchOptions
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      "Could not connect to the booking server. Check that the backend is running."
    );
  }

  const text = await response.text();
  let payload: unknown = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : `Request failed (${response.status})`;

    throw new ApiError(response.status, message);
  }

  return payload as T;
}

export async function getEstimate(
  token: string | null,
  pickup: string,
  destination: string
): Promise<TripEstimate> {
  const data = await apiFetch<{ estimate: TripEstimate }>(
    "/api/rides/estimate",
    { method: "POST", body: { pickup, destination }, token }
  );

  return data.estimate;
}

export async function createRide(
  token: string | null,
  payload: { pickup: string; destination: string; rideType: RideType }
): Promise<Ride> {
  const data = await apiFetch<{ ride: Ride }>("/api/rides", {
    method: "POST",
    body: payload,
    token,
  });

  return data.ride;
}

export async function listRides(
  token: string | null,
  page = 1,
  limit = 10
): Promise<{ rides: Ride[]; pagination?: Pagination }> {
  const data = await apiFetch<{ rides: Ride[]; pagination?: Pagination }>(
    `/api/rides?page=${page}&limit=${limit}`,
    { token }
  );

  return { rides: data.rides ?? [], pagination: data.pagination };
}

export async function cancelRide(
  token: string | null,
  id: string
): Promise<Ride> {
  const data = await apiFetch<{ ride: Ride }>(`/api/rides/${id}/cancel`, {
    method: "POST",
    token,
  });

  return data.ride;
}
