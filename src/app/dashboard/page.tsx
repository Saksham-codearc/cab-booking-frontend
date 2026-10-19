"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import ActiveRideCard from "@/components/ActiveRideCard";
import AppHeader from "@/components/AppHeader";
import BookingForm from "@/components/BookingForm";
import MapView, { type MapPoint } from "@/components/MapView";
import type { PlaceValue } from "@/components/PlaceInput";
import RideCard from "@/components/RideCard";
import { apiFetch } from "@/lib/api";
import type { Ride } from "@/lib/types";

function toMapPoint(place: PlaceValue): MapPoint | null {
  if (place.lat === undefined || place.lng === undefined) return null;
  return { lat: place.lat, lng: place.lng, label: place.address };
}

export default function DashboardPage() {
  const { getToken } = useAuth();

  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pickup, setPickup] = useState<MapPoint | null>(null);
  const [dropoff, setDropoff] = useState<MapPoint | null>(null);

  const loadRides = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const [activeData, listData] = await Promise.all([
        apiFetch<{ ride: Ride | null }>("/api/rides/active", token),
        apiFetch<{ rides: Ride[] }>("/api/rides?limit=5", token),
      ]);

      setActiveRide(activeData.ride ?? null);
      setRecentRides(listData.rides ?? []);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load your rides right now."
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void Promise.resolve().then(() => loadRides());
  }, [loadRides]);

  // Keep an in-flight ride fresh without requiring a manual refresh.
  const hasActiveRide = activeRide !== null;
  useEffect(() => {
    if (!hasActiveRide) return;
    const timer = window.setInterval(() => void loadRides(), 12000);
    return () => window.clearInterval(timer);
  }, [hasActiveRide, loadRides]);

  const handleRouteChange = useCallback((nextPickup: PlaceValue, nextDropoff: PlaceValue) => {
    setPickup(toMapPoint(nextPickup));
    setDropoff(toMapPoint(nextDropoff));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-16 sm:px-6 lg:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
              Book a ride
            </p>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Where are you headed?
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Set your pickup and drop-off, compare rides, and see the fare before
              you confirm. Fares are calculated on the server.
            </p>
          </div>

          <Link
            href="/rides/history"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Ride history
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-800/60 bg-amber-950/40 p-4 text-sm text-amber-200"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadRides()}
              className="rounded-lg border border-amber-700 px-3 py-1.5 text-xs font-semibold transition hover:bg-amber-900/40"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
          <section
            id="book"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
          >
            <BookingForm onCreated={() => void loadRides()} onRouteChange={handleRouteChange} />
          </section>

          <div className="space-y-6">
            {activeRide && <ActiveRideCard ride={activeRide} onChanged={() => void loadRides()} />}

            <MapView pickup={pickup} dropoff={dropoff} />

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-sm font-bold text-slate-200">Booking tips</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>Pick an address from the suggestions to get an exact fare.</li>
                <li>Your driver sees the request the moment you confirm it.</li>
                <li>You can cancel for free until the ride starts.</li>
              </ul>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight">Recent rides</h2>
            <Link
              href="/rides/history"
              className="text-sm font-semibold text-cyan-400 hover:underline"
            >
              See all rides
            </Link>
          </div>

          {loading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900"
                />
              ))}
            </div>
          ) : recentRides.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
              <p className="font-semibold text-slate-200">No rides yet</p>
              <p className="mt-1 text-sm text-slate-400">
                Book your first ride above and it will show up here.
              </p>
              <a
                href="#book"
                className="mt-4 inline-flex rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Book a ride
              </a>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {recentRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
