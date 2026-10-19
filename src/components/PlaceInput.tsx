"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export interface PlaceValue {
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}

interface PlaceInputProps {
  id: string;
  label: string;
  value: PlaceValue;
  onChange: (value: PlaceValue) => void;
  placeholder?: string;
  required?: boolean;
}

export default function PlaceInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
}: PlaceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [placesEnabled, setPlacesEnabled] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey || !inputRef.current) return;

      try {
        setOptions({ key: apiKey, v: "weekly" });
        const places = await importLibrary("places");
        if (cancelled || !inputRef.current) return;

        const autocomplete = new places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry", "place_id", "name"],
          componentRestrictions: { country: "in" },
          types: ["geocode"],
        });
        autocompleteRef.current = autocomplete;

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place?.geometry?.location) return;
          onChangeRef.current({
            address:
              place.formatted_address || place.name || inputRef.current?.value || "",
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id,
          });
        });

        setPlacesEnabled(true);
      } catch (error) {
        console.warn("Places autocomplete unavailable; using plain text input.", error);
      }
    }

    void init();
    return () => {
      cancelled = true;
      if (autocompleteRef.current) {
        window.google?.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          value={value.address}
          onChange={(event) =>
            onChangeRef.current({ address: event.target.value })
          }
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 outline-none transition focus:border-cyan-400"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        >
          📍
        </span>
      </div>
      {!placesEnabled && value.address.length > 3 && (
        <p className="mt-1 text-xs text-slate-500">
          Tip: choose a suggestion to include exact coordinates and an accurate fare.
        </p>
      )}
    </div>
  );
}
