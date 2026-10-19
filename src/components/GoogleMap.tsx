
"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

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
        setOptions({
  key: apiKey,
  v: "weekly",
});

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
          className="mb-3 rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      <div
        ref={mapRef}
        className="h-[320px] w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900"
        aria-label="Google map centered on Delhi"
      />
    </div>
  );
}
