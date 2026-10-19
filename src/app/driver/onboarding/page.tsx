"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import AppHeader from "@/components/AppHeader";
import { useProfile } from "@/components/ProfileProvider";
import { apiFetch } from "@/lib/api";
import { rideTypeLabels } from "@/lib/format";
import type { RideType } from "@/lib/types";

const RIDE_TYPES: RideType[] = ["standard", "premium", "xl"];

const EMPTY_FORM = {
  licenseNumber: "",
  vehicleMake: "",
  vehicleModel: "",
  vehiclePlate: "",
  vehicleType: "standard" as RideType,
};

export default function DriverOnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profileLoading && profile?.role === "driver") {
      router.replace("/driver");
    }
  }, [profileLoading, profile, router]);

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Please sign in again.");

      await apiFetch("/api/drivers/register", token, {
        method: "POST",
        body: JSON.stringify({
          licenseNumber: form.licenseNumber.trim(),
          vehicleMake: form.vehicleMake.trim(),
          vehicleModel: form.vehicleModel.trim(),
          vehiclePlate: form.vehiclePlate.trim().toUpperCase(),
          vehicleType: form.vehicleType,
        }),
      });

      await refreshProfile();
      router.push("/driver");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your driver profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppHeader />

      <main className="mx-auto w-full max-w-2xl px-4 py-6 pb-16 sm:px-6 lg:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
          Drive with RideFlow
        </p>
        <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Turn your car into an income
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Register your vehicle to start receiving nearby ride requests. For this
          demo, driver profiles are approved automatically.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
        >
          <div>
            <label htmlFor="licenseNumber" className="mb-1.5 block text-sm font-medium">
              Driving licence number
            </label>
            <input
              id="licenseNumber"
              value={form.licenseNumber}
              onChange={(event) => update("licenseNumber", event.target.value)}
              required
              minLength={3}
              maxLength={60}
              placeholder="DL-0420210000000"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="vehicleMake" className="mb-1.5 block text-sm font-medium">
                Vehicle make
              </label>
              <input
                id="vehicleMake"
                value={form.vehicleMake}
                onChange={(event) => update("vehicleMake", event.target.value)}
                required
                maxLength={60}
                placeholder="Maruti"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </div>
            <div>
              <label htmlFor="vehicleModel" className="mb-1.5 block text-sm font-medium">
                Vehicle model
              </label>
              <input
                id="vehicleModel"
                value={form.vehicleModel}
                onChange={(event) => update("vehicleModel", event.target.value)}
                required
                maxLength={60}
                placeholder="Dzire"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="vehiclePlate" className="mb-1.5 block text-sm font-medium">
                Number plate
              </label>
              <input
                id="vehiclePlate"
                value={form.vehiclePlate}
                onChange={(event) => update("vehiclePlate", event.target.value.toUpperCase())}
                required
                maxLength={30}
                placeholder="DL 1 AB 1234"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 uppercase outline-none transition focus:border-cyan-400"
              />
            </div>
            <div>
              <label htmlFor="vehicleType" className="mb-1.5 block text-sm font-medium">
                Vehicle category
              </label>
              <select
                id="vehicleType"
                value={form.vehicleType}
                onChange={(event) => update("vehicleType", event.target.value as RideType)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400"
              >
                {RIDE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {rideTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-cyan-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Start driving"}
          </button>

          <p className="text-center text-xs text-slate-500">
            You can keep booking rides as a rider too.{" "}
            <Link href="/dashboard" className="text-cyan-400 hover:underline">
              Back to booking
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
