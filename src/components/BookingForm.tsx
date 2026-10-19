"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import PlaceInput, { PlaceValue } from "./PlaceInput";
import { apiFetch, API_URL } from "@/lib/api";
import { payWithRazorpay } from "@/lib/razorpay";
import { formatCurrency, rideTypeLabels, rideTypeDescriptions } from "@/lib/format";
import type { BookingResponse, RideType } from "@/lib/types";

interface BookingFormProps {
  onCreated: (rideId: string) => void;
  /** Reports the current route so a parent can render it on a map. */
  onRouteChange?: (pickup: PlaceValue, dropoff: PlaceValue) => void;
  disabled?: boolean;
}

const RIDE_TYPES: RideType[] = ["standard", "premium", "xl"];

export default function BookingForm({ onCreated, onRouteChange, disabled }: BookingFormProps) {
  const { getToken } = useAuth();

  const [pickup, setPickup] = useState<PlaceValue>({ address: "" });
  const [dropoff, setDropoff] = useState<PlaceValue>({ address: "" });
  const [rideType, setRideType] = useState<RideType>("standard");
  const [fares, setFares] = useState<Record<string, number> | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    onRouteChange?.(pickup, dropoff);
  }, [pickup, dropoff, onRouteChange]);

  const pickupHasCoords = pickup.lat !== undefined && pickup.lng !== undefined;
  const dropoffHasCoords = dropoff.lat !== undefined && dropoff.lng !== undefined;

  useEffect(() => {
    if (!pickupHasCoords || !dropoffHasCoords) return;

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setEstimating(true);
      try {
        const query = new URLSearchParams({
          pickupLat: String(pickup.lat),
          pickupLng: String(pickup.lng),
          dropoffLat: String(dropoff.lat),
          dropoffLng: String(dropoff.lng),
        });
        const data = await apiFetch<{ fares: Record<string, { estimatedFare: number }> }>(
          `/api/maps/estimate?${query.toString()}`,
          null
        );
        if (!cancelled) {
          const mapped: Record<string, number> = {};
          for (const [type, fare] of Object.entries(data.fares)) {
            mapped[type] = fare.estimatedFare;
          }
          setFares(mapped);
        }
      } catch (error) {
        console.warn("Fare estimate failed", error);
      } finally {
        if (!cancelled) setEstimating(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [pickupHasCoords, dropoffHasCoords, pickup.lat, pickup.lng, dropoff.lat, dropoff.lng]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!pickup.address.trim() || !dropoff.address.trim()) {
      setMessage("Enter both pickup and drop-off.");
      return;
    }
    if (pickup.address.trim().toLowerCase() === dropoff.address.trim().toLowerCase()) {
      setMessage("Pickup and drop-off must be different.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Please sign in again to book a ride.");

      const created = await apiFetch<BookingResponse>("/api/rides", token, {
        method: "POST",
        body: JSON.stringify({
          pickup: pickupHasCoords
            ? {
                address: pickup.address,
                lat: pickup.lat,
                lng: pickup.lng,
                placeId: pickup.placeId,
              }
            : pickup.address,
          dropoff: dropoffHasCoords
            ? {
                address: dropoff.address,
                lat: dropoff.lat,
                lng: dropoff.lng,
                placeId: dropoff.placeId,
              }
            : dropoff.address,
          rideType,
        }),
      });

      if (created.payment?.orderId) {
        try {
          const response = await payWithRazorpay({
            orderId: created.payment.orderId,
            amount: created.payment.amount,
            currency: created.payment.currency,
            keyId: created.payment.keyId,
          });
          await apiFetch("/api/payments/verify", token, {
            method: "POST",
            body: JSON.stringify({
              rideId: created.ride.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          setMessage("Payment authorized. You'll be charged after the ride.");
        } catch {
          setMessage(
            `${created.message ?? "Ride requested!"} You can pay after the ride from the ride page.`
          );
        }
      } else {
        setMessage(created.message ?? "Ride requested!");
      }

      onCreated(created.ride.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create your ride request.");
    } finally {
      setLoading(false);
    }
  }

  const hasRoute = pickupHasCoords && dropoffHasCoords;
  const selectedFare = hasRoute ? fares?.[rideType] : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PlaceInput
        id="pickup"
        label="Pickup location"
        value={pickup}
        onChange={setPickup}
        placeholder="e.g. Connaught Place, Delhi"
        required
      />
      <PlaceInput
        id="dropoff"
        label="Drop-off location"
        value={dropoff}
        onChange={setDropoff}
        placeholder="e.g. India Gate, Delhi"
        required
      />

      <div className="space-y-2">
        <p className="text-sm font-medium">Choose your ride</p>
        <div className="grid gap-2">
          {RIDE_TYPES.map((type) => (
            <label
              key={type}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                rideType === type
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="rideType"
                  value={type}
                  checked={rideType === type}
                  onChange={() => setRideType(type)}
                  className="accent-cyan-400"
                />
                <span>
                  <span className="block font-medium">{rideTypeLabels[type]}</span>
                  <span className="block text-xs text-slate-400">
                    {rideTypeDescriptions[type]}
                  </span>
                </span>
              </span>
              <span className="font-semibold">
                {hasRoute && fares ? formatCurrency(fares[type]) : "—"}
              </span>
            </label>
          ))}
        </div>
        {estimating && <p className="text-xs text-slate-500">Calculating fares…</p>}
        {hasRoute && fares && (
          <p className="text-xs text-slate-500">
            Estimated fare: {formatCurrency(selectedFare)} · distance-based, final price shown on the receipt.
          </p>
        )}
        {!fares && pickupHasCoords === false && (
          <p className="text-xs text-slate-500">
            Pick locations from suggestions for an exact fare and faster matching.
          </p>
        )}
      </div>

      {message && (
        <p
          role="status"
          className="rounded-lg border border-cyan-900 bg-cyan-950/50 p-3 text-sm text-cyan-200"
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || disabled}
        className="w-full rounded-xl bg-cyan-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
      >
        {loading ? "Requesting…" : "Request ride"}
      </button>
      <p className="text-xs leading-5 text-slate-500">
        Payment is authorized when you book and captured after the trip completes.
        API base: {API_URL.includes("localhost") ? "local backend" : "live backend"}.
      </p>
    </form>
  );
}
