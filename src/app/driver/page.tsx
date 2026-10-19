"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import AppHeader from "@/components/AppHeader";
import MapView from "@/components/MapView";
import RideStatusTimeline from "@/components/RideStatusTimeline";
import { useProfile } from "@/components/ProfileProvider";
import { apiFetch } from "@/lib/api";
import { formatCurrency, rideTypeLabels, statusLabel } from "@/lib/format";
import type { DriverProfile, Ride } from "@/lib/types";

interface DriverMeResponse {
  driver: DriverProfile | null;
  stats: { earnings: number; trips: number; distanceKm: number };
}

interface RequestsResponse {
  requests: Ride[];
}

interface ActiveRideResponse {
  ride: Ride | null;
}

type RideAction = "arrive" | "start" | "complete";

function currentPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    const timer = window.setTimeout(() => resolve(null), 6000);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timer);
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        window.clearTimeout(timer);
        resolve(null);
      },
      { timeout: 6000, maximumAge: 30000 }
    );
  });
}

export default function DriverPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [stats, setStats] = useState<DriverMeResponse["stats"] | null>(null);
  const [requests, setRequests] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);
  const [acting, setActing] = useState("");

  useEffect(() => {
    if (!profileLoading && profile && profile.role !== "driver") {
      router.replace("/driver/onboarding");
    }
  }, [profileLoading, profile, router]);

  const loadAll = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const [me, rideRequests, active] = await Promise.allSettled([
        apiFetch<DriverMeResponse>("/api/drivers/me", token),
        apiFetch<RequestsResponse>("/api/drivers/requests", token),
        apiFetch<ActiveRideResponse>("/api/rides/active", token),
      ]);

      if (me.status === "fulfilled") {
        setDriver(me.value.driver);
        setStats(me.value.stats);
      }

      if (rideRequests.status === "fulfilled") {
        setRequests(rideRequests.value.requests ?? []);
      }

      if (active.status === "fulfilled") {
        setActiveRide(active.value.ride ?? null);
      }

      if (me.status === "rejected" && rideRequests.status === "rejected") {
        throw me.reason;
      }

      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your driver dashboard.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void Promise.resolve().then(() => loadAll());
  }, [loadAll]);

  const shouldPoll = Boolean(activeRide) || Boolean(driver?.is_online);
  useEffect(() => {
    if (!shouldPoll) return;
    const timer = window.setInterval(() => void loadAll(), 10000);
    return () => window.clearInterval(timer);
  }, [shouldPoll, loadAll]);

  async function toggleOnline() {
    if (!driver) return;
    setToggling(true);
    setError("");
    try {
      const token = await getToken();
      const goingOnline = !driver.is_online;
      const position = goingOnline ? await currentPosition() : null;

      await apiFetch("/api/drivers/status", token, {
        method: "PATCH",
        body: JSON.stringify({
          isOnline: goingOnline,
          ...(position ? { lat: position.lat, lng: position.lng } : {}),
        }),
      });

      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your availability.");
    } finally {
      setToggling(false);
    }
  }

  async function acceptRide(rideId: string) {
    setActing(rideId);
    setError("");
    try {
      const token = await getToken();
      await apiFetch(`/api/rides/${rideId}/accept`, token, { method: "POST" });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept this ride.");
    } finally {
      setActing("");
    }
  }

  async function advanceRide(action: RideAction) {
    if (!activeRide) return;
    setActing(action);
    setError("");
    try {
      const token = await getToken();
      await apiFetch(`/api/rides/${activeRide.id}/${action}`, token, { method: "POST" });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this ride.");
    } finally {
      setActing("");
    }
  }

  const isOnline = Boolean(driver?.is_online);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-16 sm:px-6 lg:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
              Driver console
            </p>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {profile?.full_name || "Partner"}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {isOnline
                ? "You are online. Nearby requests appear below."
                : "Go online to start receiving ride requests."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void toggleOnline()}
            disabled={toggling || !driver}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:opacity-60 ${
              isOnline
                ? "border border-red-800 text-red-300 hover:bg-red-950/40"
                : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
            }`}
          >
            {toggling ? "Updating…" : isOnline ? "Go offline" : "Go online"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-800/60 bg-amber-950/40 p-4 text-sm text-amber-200"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadAll()}
              className="rounded-lg border border-amber-700 px-3 py-1.5 text-xs font-semibold transition hover:bg-amber-900/40"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"
              />
            ))}
          </div>
        ) : !driver ? (
          <div className="mt-7 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
            <p className="font-semibold text-slate-200">No driver profile found</p>
            <p className="mt-1 text-sm text-slate-400">
              Register your vehicle to start accepting rides.
            </p>
            <Link
              href="/driver/onboarding"
              className="mt-4 inline-flex rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Register as a driver
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total earnings", value: formatCurrency(stats?.earnings ?? 0) },
                { label: "Completed trips", value: String(stats?.trips ?? 0) },
                { label: "Distance driven", value: `${Number(stats?.distanceKm ?? 0).toFixed(1)} km` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <p className="text-xs uppercase tracking-wider text-slate-500">{item.label}</p>
                  <p className="mt-1.5 text-2xl font-extrabold">{item.value}</p>
                </div>
              ))}
            </section>

            {activeRide && (
              <section className="mt-6 rounded-2xl border border-cyan-900/60 bg-slate-900 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-cyan-400">Current ride</p>
                    <h2 className="mt-1 text-lg font-bold">{statusLabel(activeRide.status)}</h2>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(activeRide.final_fare ?? activeRide.estimated_fare, activeRide.currency)}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="flex gap-2">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400" aria-hidden />
                    {activeRide.pickup_address}
                  </p>
                  <p className="flex gap-2">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-orange-400" aria-hidden />
                    {activeRide.dropoff_address}
                  </p>
                  {activeRide.rider?.full_name && (
                    <p className="text-slate-400">Rider: {activeRide.rider.full_name}</p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeRide.status === "accepted" && (
                    <button
                      type="button"
                      onClick={() => void advanceRide("arrive")}
                      disabled={Boolean(acting)}
                      className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
                    >
                      {acting === "arrive" ? "Updating…" : "I have arrived"}
                    </button>
                  )}
                  {activeRide.status === "arrived" && (
                    <button
                      type="button"
                      onClick={() => void advanceRide("start")}
                      disabled={Boolean(acting)}
                      className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
                    >
                      {acting === "start" ? "Updating…" : "Start ride"}
                    </button>
                  )}
                  {activeRide.status === "in_progress" && (
                    <button
                      type="button"
                      onClick={() => void advanceRide("complete")}
                      disabled={Boolean(acting)}
                      className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
                    >
                      {acting === "complete" ? "Completing…" : "Complete ride"}
                    </button>
                  )}
                  <Link
                    href={`/rides/${activeRide.id}`}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                  >
                    Ride details
                  </Link>
                </div>

                <div className="mt-5 border-t border-slate-800 pt-4">
                  <RideStatusTimeline ride={activeRide} />
                </div>

                <div className="mt-5">
                  <MapView
                    pickup={
                      activeRide.pickup_lat !== null && activeRide.pickup_lng !== null
                        ? { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng }
                        : null
                    }
                    dropoff={
                      activeRide.dropoff_lat !== null && activeRide.dropoff_lng !== null
                        ? { lat: activeRide.dropoff_lat, lng: activeRide.dropoff_lng }
                        : null
                    }
                  />
                </div>
              </section>
            )}

            <section className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold tracking-tight">Nearby requests</h2>
                <span className="text-sm text-slate-500">
                  {isOnline ? `${requests.length} open` : "Go online to see requests"}
                </span>
              </div>

              {!isOnline ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-sm text-slate-400">
                  You are offline. Toggle online to start receiving ride requests.
                </div>
              ) : requests.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-sm text-slate-400">
                  No open requests right now. We will refresh automatically.
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {requests.map((ride) => (
                    <article
                      key={ride.id}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">
                          {rideTypeLabels[ride.vehicle_type] ?? ride.vehicle_type}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(ride.estimated_fare, ride.currency)}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        <p className="flex gap-2">
                          <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400" aria-hidden />
                          {ride.pickup_address}
                        </p>
                        <p className="flex gap-2">
                          <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-orange-400" aria-hidden />
                          {ride.dropoff_address}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span>
                          {ride.distance_to_pickup_km !== null && ride.distance_to_pickup_km !== undefined
                            ? `${Number(ride.distance_to_pickup_km).toFixed(1)} km away`
                            : "Distance unavailable"}
                        </span>
                        <button
                          type="button"
                          onClick={() => void acceptRide(ride.id)}
                          disabled={Boolean(acting) || Boolean(activeRide)}
                          className="rounded-lg bg-cyan-400 px-4 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
                        >
                          {acting === ride.id ? "Accepting…" : "Accept ride"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
