"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GoogleMap from "@/components/GoogleMap";
import LocationField from "@/components/LocationField";
import RideHistory from "@/components/RideHistory";
import ServicePicker from "@/components/ServicePicker";
import {
  ArrowRightIcon,
  BoltIcon,
  ShieldIcon,
  WalletIcon,
} from "@/components/icons";
import {
  cancelRide,
  createRide,
  getEstimate,
  listRides,
  type Ride,
  type RideType,
  type TripEstimate,
} from "@/lib/api";

const RIDE_LABELS: Record<RideType, string> = {
  standard: "Ride Standard",
  premium: "Ride Premium",
  xl: "Ride XL",
};

const HIGHLIGHTS = [
  {
    Icon: BoltIcon,
    title: "Fast booking",
    copy: "Two fields and you are done.",
  },
  {
    Icon: ShieldIcon,
    title: "Upfront fares",
    copy: "Priced on the server, never guessed.",
  },
  {
    Icon: WalletIcon,
    title: "Clear history",
    copy: "Every trip, saved in one place.",
  },
];

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
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

    // Deferred a tick so state updates stay out of the synchronous effect body.
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
    }, 500);

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

  function handleSwap() {
    setPickup(destination);
    setDestination(pickup);
  }

  async function handleBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const trimmedPickup = pickup.trim();
    const trimmedDestination = destination.trim();

    if (!trimmedPickup || !trimmedDestination) {
      setMessage("Please enter both pickup and drop locations.");
      return;
    }

    if (trimmedPickup.toLowerCase() === trimmedDestination.toLowerCase()) {
      setMessage("Pickup and drop must be different.");
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

      setMessage(
        `Ride requested! Booking id ${ride.id.slice(0, 8)} · ${RIDE_LABELS[rideType]}`
      );
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

      setMessage(`Ride ${ride.id.slice(0, 8)} cancelled.`);
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
      <div className="grid min-h-screen place-items-center bg-ink-50">
        <p className="animate-soft-pulse text-sm font-semibold text-ink-500">
          Loading your dashboard…
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50 px-6">
        <div className="card w-full max-w-sm p-6 text-center">
          <p className="text-sm font-bold">You are signed out</p>
          <Link href="/sign-in" className="btn-ink mt-4 px-5 py-3 text-sm">
            Sign in to book
          </Link>
        </div>
      </div>
    );
  }

  const firstName = user?.firstName || "rider";

  return (
    <div className="min-h-screen bg-ink-50 pb-24 lg:pb-12">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-5 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
          <form
            onSubmit={handleBooking}
            className="card p-5 lg:sticky lg:top-24"
          >
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-extrabold tracking-tight">
                Book a ride
              </h1>
              <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide">
                Upfront fare
              </span>
            </div>

            <p className="mt-1 text-sm text-ink-500">
              Hey {firstName}, where are you heading today?
            </p>

            <div className="mt-5">
              <LocationField
                pickup={pickup}
                destination={destination}
                onPickupChange={handlePickupChange}
                onDestinationChange={handleDestinationChange}
                onSwap={handleSwap}
                disabled={loading}
              />
            </div>

            <div className="mt-5">
              <ServicePicker
                rideType={rideType}
                onSelect={setRideType}
                estimate={estimate}
                estimating={estimating}
                disabled={loading}
              />
            </div>

            {estimateError && (
              <p
                role="alert"
                className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700"
              >
                {estimateError}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="mt-4 rounded-2xl border border-brand-300 bg-brand-50 p-3 text-sm font-medium"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-brand mt-5 w-full px-5 py-4 text-base disabled:opacity-60"
            >
              {loading ? "Booking…" : `Book ${RIDE_LABELS[rideType]}`}
              {!loading && <ArrowRightIcon className="h-5 w-5" />}
            </button>

            <p className="mt-3 text-center text-[11px] text-ink-400">
              Fares are calculated on our servers — no surprises at the end.
            </p>
          </form>

          <div className="space-y-6">
            <section className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <h2 className="text-sm font-extrabold">Around you</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Delhi NCR
                </span>
              </div>

              <GoogleMap />
            </section>

            <RideHistory
              rides={rides}
              loading={ridesLoading}
              error={ridesError}
              cancellingId={cancellingId}
              onCancel={handleCancel}
              onRefresh={() => void loadRides()}
            />

            <section id="offers" className="grid gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map(({ Icon, title, copy }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-ink-200 bg-white p-4"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-ink-900">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs text-ink-500">{copy}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
