"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import AppHeader from "@/components/AppHeader";
import MapView from "@/components/MapView";
import RideStatusTimeline from "@/components/RideStatusTimeline";
import StarRating from "@/components/StarRating";
import { apiFetch } from "@/lib/api";
import {
  formatCurrency,
  formatDateTime,
  rideTypeLabels,
  statusLabel,
} from "@/lib/format";
import { payWithRazorpay } from "@/lib/razorpay";
import type { Review, Ride, RideEvent } from "@/lib/types";

interface RideDetailResponse {
  ride: Ride;
  events: RideEvent[];
  review: Review | null;
}

const ACTIVE_STATUSES = ["requested", "accepted", "arrived", "in_progress"];

const STATUS_STYLES: Record<string, string> = {
  requested: "border-amber-700/50 bg-amber-500/15 text-amber-300",
  accepted: "border-cyan-700/50 bg-cyan-500/15 text-cyan-300",
  arrived: "border-blue-700/50 bg-blue-500/15 text-blue-300",
  in_progress: "border-indigo-700/50 bg-indigo-500/15 text-indigo-300",
  completed: "border-emerald-700/50 bg-emerald-500/15 text-emerald-300",
  cancelled: "border-red-800/50 bg-red-500/15 text-red-300",
};

export default function RideDetailPage() {
  const { id: rideId } = useParams<{ id: string }>();
  const { getToken } = useAuth();

  const [data, setData] = useState<RideDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState("");

  const [paying, setPaying] = useState(false);
  const [payMessage, setPayMessage] = useState("");

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const loadRide = useCallback(async () => {
    if (!rideId) return;
    try {
      const token = await getToken();
      if (!token) return;
      const result = await apiFetch<RideDetailResponse>(`/api/rides/${rideId}`, token);
      setData(result);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this ride.");
    } finally {
      setLoading(false);
    }
  }, [rideId, getToken]);

  useEffect(() => {
    void Promise.resolve().then(() => loadRide());
  }, [loadRide]);

  const ride = data?.ride;
  const isActive = ride ? ACTIVE_STATUSES.includes(ride.status) : false;

  useEffect(() => {
    if (!isActive) return;
    const timer = window.setInterval(() => void loadRide(), 10000);
    return () => window.clearInterval(timer);
  }, [isActive, loadRide]);

  async function cancelRide() {
    if (!ride) return;
    setCancelling(true);
    setActionError("");
    try {
      const token = await getToken();
      await apiFetch(`/api/rides/${ride.id}/cancel`, token, { method: "POST" });
      await loadRide();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not cancel this ride.");
    } finally {
      setCancelling(false);
    }
  }

  async function payNow() {
    if (!ride) return;
    setPaying(true);
    setPayMessage("");
    try {
      const token = await getToken();
      const order = await apiFetch<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>(`/api/payments/order/${ride.id}`, token, { method: "POST" });

      const result = await payWithRazorpay({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        keyId: order.keyId,
      });

      await apiFetch("/api/payments/verify", token, {
        method: "POST",
        body: JSON.stringify({ rideId: ride.id, ...result }),
      });

      setPayMessage("Payment authorized. It will be captured when the trip completes.");
      await loadRide();
    } catch (err) {
      setPayMessage(err instanceof Error ? err.message : "Payment could not be completed.");
    } finally {
      setPaying(false);
    }
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ride || rating < 1) {
      setReviewError("Choose a rating from 1 to 5 stars.");
      return;
    }
    setReviewing(true);
    setReviewError("");
    try {
      const token = await getToken();
      await apiFetch(`/api/rides/${ride.id}/review`, token, {
        method: "POST",
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      await loadRide();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Could not submit your review.");
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-16 sm:px-6 lg:py-10">
        <Link
          href="/rides/history"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to history
        </Link>

        {loading ? (
          <div className="mt-5 space-y-4">
            <div className="h-24 animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />
            <div className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />
          </div>
        ) : error || !ride ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-amber-800/60 bg-amber-950/40 p-5 text-sm text-amber-200"
          >
            <p className="font-semibold">Ride unavailable</p>
            <p className="mt-1">{error || "This ride could not be found."}</p>
            <button
              type="button"
              onClick={() => void loadRide()}
              className="mt-4 rounded-lg border border-amber-700 px-3 py-1.5 text-xs font-semibold transition hover:bg-amber-900/40"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${
                      STATUS_STYLES[ride.status] ?? "border-slate-700 bg-slate-800 text-slate-300"
                    }`}
                  >
                    {statusLabel(ride.status)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {rideTypeLabels[ride.vehicle_type] ?? ride.vehicle_type} ·{" "}
                    {formatDateTime(ride.requested_at)}
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {ride.pickup_address} → {ride.dropoff_address}
                </h1>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {ride.status === "completed" ? "Final fare" : "Estimated fare"}
                </p>
                <p className="text-2xl font-extrabold">
                  {formatCurrency(ride.final_fare ?? ride.estimated_fare, ride.currency)}
                </p>
              </div>
            </header>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
              <div className="space-y-5">
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="space-y-3 text-sm">
                    <p className="flex items-start gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400" aria-hidden />
                      <span>
                        <span className="block text-xs uppercase tracking-wider text-slate-500">
                          Pickup
                        </span>
                        {ride.pickup_address}
                      </span>
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-orange-400" aria-hidden />
                      <span>
                        <span className="block text-xs uppercase tracking-wider text-slate-500">
                          Drop-off
                        </span>
                        {ride.dropoff_address}
                      </span>
                    </p>
                  </div>

                  {(ride.distance_km || ride.duration_min) && (
                    <div className="mt-4 flex gap-4 border-t border-slate-800 pt-4 text-sm text-slate-400">
                      {ride.distance_km ? <span>{Number(ride.distance_km).toFixed(1)} km</span> : null}
                      {ride.duration_min ? <span>~{Math.round(Number(ride.duration_min))} min</span> : null}
                    </div>
                  )}
                </section>

                <MapView
                  pickup={
                    ride.pickup_lat !== null && ride.pickup_lng !== null
                      ? { lat: ride.pickup_lat, lng: ride.pickup_lng, label: ride.pickup_address }
                      : null
                  }
                  dropoff={
                    ride.dropoff_lat !== null && ride.dropoff_lng !== null
                      ? { lat: ride.dropoff_lat, lng: ride.dropoff_lng, label: ride.dropoff_address }
                      : null
                  }
                />

                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Trip progress
                  </h2>
                  <div className="mt-4">
                    <RideStatusTimeline ride={ride} />
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Payment
                  </h2>
                  <p className="mt-3 text-sm text-slate-300">
                    Status:{" "}
                    <span className="font-semibold capitalize">
                      {ride.payment_status?.replace(/_/g, " ") ?? "unknown"}
                    </span>
                  </p>

                  {ride.base_fare ? (
                    <dl className="mt-3 space-y-1.5 text-sm text-slate-400">
                      <div className="flex justify-between">
                        <dt>Base fare</dt>
                        <dd>{formatCurrency(ride.base_fare, ride.currency)}</dd>
                      </div>
                      {ride.platform_fee ? (
                        <div className="flex justify-between">
                          <dt>Platform fee</dt>
                          <dd>{formatCurrency(ride.platform_fee, ride.currency)}</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}

                  {ride.payment_status !== "paid" && ride.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => void payNow()}
                      disabled={paying}
                      className="mt-4 w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
                    >
                      {paying ? "Opening checkout…" : "Pay with Razorpay"}
                    </button>
                  )}

                  {payMessage && (
                    <p className="mt-3 rounded-lg bg-slate-800/60 p-3 text-xs text-slate-300">
                      {payMessage}
                    </p>
                  )}
                </section>

                {ride.driver && (
                  <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Your driver
                    </h2>
                    <p className="mt-3 font-semibold">{ride.driver.full_name}</p>
                    {ride.driver.phone && (
                      <a
                        href={`tel:${ride.driver.phone}`}
                        className="mt-1 inline-block text-sm text-cyan-400 hover:underline"
                      >
                        {ride.driver.phone}
                      </a>
                    )}
                  </section>
                )}

                {ride.status !== "completed" && ride.status !== "cancelled" && (
                  <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Need to change plans?
                    </h2>
                    <button
                      type="button"
                      onClick={() => void cancelRide()}
                      disabled={cancelling}
                      className="mt-3 w-full rounded-xl border border-red-800 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-950/50 disabled:opacity-60"
                    >
                      {cancelling ? "Cancelling…" : "Cancel ride"}
                    </button>
                    {actionError && (
                      <p className="mt-3 text-xs text-red-300">{actionError}</p>
                    )}
                  </section>
                )}

                {ride.status === "completed" && (
                  <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Rate your ride
                    </h2>

                    {data?.review ? (
                      <div className="mt-3">
                        <StarRating value={data.review.rating} size="md" showValue />
                        {data.review.comment && (
                          <p className="mt-2 text-sm text-slate-400">{data.review.comment}</p>
                        )}
                        <p className="mt-2 text-xs text-slate-500">Thanks for the feedback.</p>
                      </div>
                    ) : (
                      <form onSubmit={submitReview} className="mt-3 space-y-3">
                        <StarRating value={rating} onChange={setRating} size="lg" />
                        <textarea
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                          rows={3}
                          maxLength={1000}
                          placeholder="Anything you want to share about the trip? (optional)"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-cyan-400"
                        />
                        {reviewError && <p className="text-xs text-red-300">{reviewError}</p>}
                        <button
                          type="submit"
                          disabled={reviewing}
                          className="w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
                        >
                          {reviewing ? "Submitting…" : "Submit review"}
                        </button>
                      </form>
                    )}
                  </section>
                )}
              </div>
            </div>

            {data?.events?.length ? (
              <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Activity
                </h2>
                <ol className="mt-3 space-y-2 text-sm">
                  {data.events.map((event) => (
                    <li key={event.id} className="flex flex-wrap justify-between gap-2 text-slate-400">
                      <span>{event.note || statusLabel(event.status)}</span>
                      <span className="text-xs text-slate-500">{formatDateTime(event.created_at)}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
