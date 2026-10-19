"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
}

interface MapViewProps {
  pickup?: MapPoint | null;
  dropoff?: MapPoint | null;
  driver?: MapPoint | null;
  className?: string;
  zoom?: number;
}

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

export default function MapView({
  pickup,
  dropoff,
  driver,
  className,
  zoom = 12,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  // Initialise the map once.
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError("Google Maps API key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
        return;
      }

      try {
        setOptions({ key: apiKey, v: "weekly" });
        const { Map } = await importLibrary("maps");
        if (cancelled || !containerRef.current) return;

        mapRef.current = new Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        setReady(true);
      } catch (err) {
        console.error("Google Maps initialization failed:", err);
        if (!cancelled) {
          setError("Could not load Google Maps. Check the API key and enabled APIs.");
        }
      }
    }

    void initialize();
    return () => {
      cancelled = true;
    };
  }, [zoom]);

  // Update markers and route whenever points change.
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    let cancelled = false;

    function drawStraightLine(a: MapPoint, b: MapPoint) {
      const maps = window.google?.maps;
      if (!maps || cancelled) return;

      new maps.Polyline({
        map,
        path: [a, b],
        strokeColor: "#22d3ee",
        strokeWeight: 4,
        strokeOpacity: 0.7,
      });

      const bounds = new maps.LatLngBounds();
      bounds.extend(a);
      bounds.extend(b);
      map.fitBounds(bounds);
    }

    async function update() {
      const maps = window.google?.maps;
      if (!maps) return;

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      rendererRef.current?.setMap(null);

      const points = [
        pickup && { ...pickup, color: "#22d3ee", title: "Pickup" },
        dropoff && { ...dropoff, color: "#fb923c", title: "Drop-off" },
        driver && { ...driver, color: "#a3e635", title: "Driver" },
      ].filter(Boolean) as Array<MapPoint & { color: string; title: string }>;

      points.forEach((point) => {
        const marker = new maps.Marker({
          map,
          position: { lat: point.lat, lng: point.lng },
          title: point.title,
          label: {
            text: point.title === "Pickup" ? "A" : point.title === "Drop-off" ? "B" : "D",
            color: "#0f172a",
            fontWeight: "700",
          },
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: point.color,
            fillOpacity: 1,
            strokeColor: "#0f172a",
            strokeWeight: 2,
          },
        });
        markersRef.current.push(marker);
      });

      if (pickup && dropoff) {
        try {
          const routes = await importLibrary("routes");
          const service = new routes.DirectionsService();
          const request: google.maps.DirectionsRequest = {
            origin: { lat: pickup.lat, lng: pickup.lng },
            destination: { lat: dropoff.lat, lng: dropoff.lng },
            travelMode: maps.TravelMode.DRIVING,
          };

          service.route(request, (result, status) => {
            if (cancelled) return;

            const bounds = result?.routes[0]?.bounds;
            if (status === "OK" && result && bounds) {
              if (!rendererRef.current) {
                rendererRef.current = new routes.DirectionsRenderer({
                  suppressMarkers: true,
                  polylineOptions: { strokeColor: "#22d3ee", strokeWeight: 5 },
                });
              }
              rendererRef.current.setMap(map);
              rendererRef.current.setDirections(result);
              map.fitBounds(bounds);
            } else {
              drawStraightLine(pickup, dropoff);
            }
          });
        } catch {
          drawStraightLine(pickup, dropoff);
        }
      } else if (points.length > 0) {
        map.setCenter({ lat: points[0].lat, lng: points[0].lng });
        map.setZoom(14);
      }
    }

    void update();
    return () => {
      cancelled = true;
    };
  }, [ready, pickup, dropoff, driver]);

  return (
    <div className={className}>
      {error && (
        <p
          role="alert"
          className="mb-2 rounded-lg border border-amber-800 bg-amber-950/50 p-3 text-sm text-amber-200"
        >
          {error}
        </p>
      )}
      <div
        ref={containerRef}
        className="h-72 w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 sm:h-80"
        aria-label="Map"
      />
    </div>
  );
}
