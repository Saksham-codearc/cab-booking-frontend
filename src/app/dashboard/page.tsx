"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import GoogleMap from "@/components/GoogleMap";
import {
  cancelRide,
  createRide,
  getEstimate,
  listRides,
  type Ride,
  type RideType,
  type TripEstimate,
} from "@/lib/api";

const RIDE_OPTIONS: Array<{ value: RideType; label: string; blurb: string }> = [
  { value: "standard", label: "Ride Standard", blurb: "Everyday cars" },
  { value: "premium", label: "Ride Premium", blurb: "Newer, comfier cars" },
  { value: "xl", label: "Ride XL", blurb: "Up to 6 seats" },
];

const STATUS_STYLES: Record<string, string> = {
  requested: "border-cyan-800 bg-cyan-950 text-cyan-300",
  accepted: "border-blue-800 bg-blue-950 text-blue-300",
  arrived: "border-indigo-800 bg-indigo-950 text-indigo-300",
  in_progress: "border-amber-800 bg-amber-950 text-amber-300",
  completed: "border-emerald-800 bg-emerald-950 text-emerald-300",
  cancelled: "border-red-800 bg-red-950 text-red-300",
};

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  const [rides, setRides] = useState<Ride[]>([]);
  const [ridesLoading, setRidesLoading] = useState(true);
  const [ridesError, setRidesError] = useState("");

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [rideType, setRideType] = useState<RideType>("standard");
  const [estimate, setEstimate] = useState<TripEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadRides = useCallback(async () => {
    setRidesLoading(true);
    setRidesError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Please sign in again to view your rides.");
      }

      const { rides: next } = await listRides(token);
      setRides(next);
    } catch (error) {
      setRidesError(
        error instanceof Error ? error.message : "Could not load ride history."
      );
    } finally {
      setRidesLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    // Deferred a tick: keeps the state updates out of the synchronous effect body.
    const timer = setTimeout(() => {
      void loadRides();
    }, 0);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, loadRides]);

  // Debounced fare estimate whenever both locations look usable.
  useEffect(() => {
    const trimmedPickup = pickup.trim();
    const trimmedDestination = destination.trim();

    if (
      !isSignedIn ||
      !trimmedPickup ||
      !trimmedDestination ||
      trimmedPickup.toLowerCase() === trimmedDestination.toLowerCase()
    ) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) {
        return;
      }

      setEstimating(true);
      setEstimateError("");

      try {
        const token = await getToken();
        const next = await getEstimate(token, trimmedPickup, trimmedDestination);

        if (!cancelled) {
          setEstimate(next);
        }
      } catch (error) {
        if (!cancelled) {
          setEstimate(null);
          setEstimateError(
            error instanceof Error
              ? error.message
              : "Could not estimate this trip."
          );
        }
      } finally {
        if (!cancelled) {
          setEstimating(false);
        }
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pickup, destination, isSignedIn, getToken]);

  function handlePickupChange(value: string) {
    setPickup(value);

    if (!value.trim() || !destination.trim()) {
      setEstimate(null);
      setEstimateError("");
    }
  }

  function handleDestinationChange(value: string) {
    setDestination(value);

    if (!value.trim() || !pickup.trim()) {
      setEstimate(null);
      setEstimateError("");
    }
  }

  async function handleBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const trimmedPickup = pickup.trim();
    const trimmedDestination = destination.trim();

    if (!trimmedPickup || !trimmedDestination) {
      setMessage("Please enter both pickup and destination.");
      return;
    }

    if (trimmedPickup.toLowerCase() === trimmedDestination.toLowerCase()) {
      setMessage("Pickup and destination must be different.");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      if (!token) {
        setMessage("Your session could not be verified. Please sign in again.");
        return;
      }

      const ride = await createRide(token, {
        pickup: trimmedPickup,
        destination: trimmedDestination,
        rideType,
      });

      setMessage(`Ride requested successfully! Ride ID: ${ride.id}`);
      setPickup("");
      setDestination("");
      setEstimate(null);
      await loadRides();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not create your ride request."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: string) {
    setCancellingId(id);
    setMessage("");

    try {
      const token = await getToken();
      const ride = await cancelRide(token, id);

      setMessage(`Ride ${ride.id.slice(0, 8)}… cancelled.`);
      await loadRides();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not cancel the ride."
      );
    } finally {
      setCancellingId(null);
    }
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Loading your dashboard...
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        You are signed out.{" "}
        <Link className="underline" href="/sign-in">
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-5 sm:px-10">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Ride<span className="text-cyan-400">Flow</span>
        </Link>

        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Sign Out
        </button>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-2 lg:py-16">
        <section className="flex flex-col justify-center">
          <p className="mb-3 font-semibold text-cyan-400">
            YOUR NEXT RIDE STARTS HERE
          </p>

          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Where would you
            <br />
            like to go?
          </h1>

          <p className="mt-4 max-w-lg text-slate-400">
            Welcome, {user.firstName || "Rider"}. Enter your pickup and
            destination to prepare your next trip.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xl">📍</p>
              <p className="mt-2 text-sm font-semibold">Pickup</p>
              <p className="mt-1 text-xs text-slate-400">Choose a location</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xl">🚘</p>
              <p className="mt-2 text-sm font-semibold">Ride</p>
              <p className="mt-1 text-xs text-slate-400">Choose your car</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xl">🏁</p>
              <p className="mt-2 text-sm font-semibold">Destination</p>
              <p className="mt-1 text-xs text-slate-400">Plan your trip</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8">
          <h2 className="text-2xl font-bold">Book a ride</h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your trip details to see live fares.
          </p>

          <form onSubmit={handleBooking} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="pickup"
                className="mb-2 block text-sm font-medium"
              >
                Pickup location
              </label>
              <input
                id="pickup"
                value={pickup}
                onChange={(event) => handlePickupChange(event.target.value)}
                placeholder="e.g. Connaught Place, Delhi"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label
                htmlFor="destination"
                className="mb-2 block text-sm font-medium"
              >
                Destination
              </label>
              <input
                id="destination"
                value={destination}
                onChange={(event) => handleDestinationChange(event.target.value)}
                placeholder="e.g. India Gate, Delhi"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Choose your ride</p>

              {estimating && (
                <p className="text-sm text-slate-400">Estimating fare…</p>
              )}

              {estimateError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-200"
                >
                  {estimateError}
                </p>
              )}

              {estimate && (
                <>
                  <p className="mb-3 text-xs text-slate-400">
                    {estimate.distanceKm} km · ~{estimate.durationMin} min
                    {estimate.source === "heuristic" && (
                      <span className="ml-1 text-slate-500">
                        (approximate estimate)
                      </span>
                    )}
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {RIDE_OPTIONS.map((option) => {
                      const selected = option.value === rideType;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRideType(option.value)}
                          aria-pressed={selected}
                          className={`rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-cyan-400 bg-slate-950 ring-2 ring-cyan-400"
                              : "border-slate-700 bg-slate-950 hover:border-slate-500"
                          }`}
                        >
                          <span className="block text-sm font-semibold">
                            {option.label}
                          </span>
                          <span className="mt-1 block text-xs text-slate-400">
                            {option.blurb}
                          </span>
                          <span className="mt-2 block font-bold text-cyan-300">
                            {estimate.currency}{" "}
                            {estimate.fares[option.value].toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {!estimate && !estimating && !estimateError && (
                <p className="text-xs text-slate-500">
                  Fare estimates appear once you enter both locations.
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
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {loading ? "Preparing..." : "Continue to booking"}
            </button>
          </form>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Fares are calculated on the server. Driver matching is coming next.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold">Explore the map</h2>
          <GoogleMap />
        </section>

        <section className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Your rides</h2>
              <p className="mt-1 text-sm text-slate-400">
                Your recent ride requests and their status.
              </p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm">
              {rides.length} rides
            </span>
          </div>

          {ridesLoading ? (
            <p className="text-slate-400">Loading your rides...</p>
          ) : ridesError ? (
            <p role="alert" className="rounded-xl bg-red-950 p-4 text-red-200">
              {ridesError}
            </p>
          ) : rides.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              No rides yet. Book your first ride above.
            </div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <article
                  key={ride.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-semibold capitalize">
                      {ride.vehicle_type} ride
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs capitalize ${
                        STATUS_STYLES[ride.status] ??
                        "border-slate-700 bg-slate-800 text-slate-300"
                      }`}
                    >
                      {ride.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <p>
                      <span className="text-cyan-400">● </span>
                      {ride.pickup_address}
                    </p>
                    <p>
                      <span className="text-orange-400">● </span>
                      {ride.dropoff_address}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4 text-sm">
                    <span className="text-slate-400">
                      {new Date(ride.requested_at).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {ride.currency}{" "}
                        {Number(ride.estimated_fare).toFixed(2)}
                      </span>

                      {ride.status === "requested" && (
                        <button
                          type="button"
                          onClick={() => handleCancel(ride.id)}
                          disabled={cancellingId === ride.id}
                          className="rounded-lg border border-red-800 px-3 py-1.5 text-red-300 transition hover:bg-red-950 disabled:opacity-50"
                        >
                          {cancellingId === ride.id ? "Cancelling…" : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
