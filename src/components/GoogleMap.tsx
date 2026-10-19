
"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

// The Maps loader must only be configured once per page load; calling
// setOptions() again logs a warning and ignores the new options.
let mapsConfigured = false;

export default function GoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        setError("Google Maps API key is missing. Check frontend/.env.local.");
        return;
      }

      try {
        if (!mapsConfigured) {
          setOptions({
            key: apiKey,
            v: "weekly",
          });
          mapsConfigured = true;
        }

        const { Map } = await importLibrary("maps");

        if (cancelled || !mapRef.current) return;

        new Map(mapRef.current, {
          center: { lat: 28.6139, lng: 77.209 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
      } catch (err) {
        console.error("Google Maps initialization failed:", err);

        if (!cancelled) {
          setError(
            "Could not load Google Maps. Check API restrictions, billing, and the browser console."
          );
        }
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full">
      {error && (
        <p
          role="alert"
          className="mx-4 mb-3 rounded-2xl border border-brand-300 bg-brand-50 p-3 text-sm font-medium text-ink-900"
        >
          {error}
        </p>
      )}

      <div
        ref={mapRef}
        className="h-[300px] w-full bg-ink-100 lg:h-[360px]"
        aria-label="Google map centered on Delhi"
      />
    </div>
  );
}
