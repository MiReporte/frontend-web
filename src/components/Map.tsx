"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export default function Map({ lat, lng, zoom = 15 }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    }).setView([lat, lng], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance.current);

    const customIcon = L.icon({
      iconUrl: "/location.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance.current);
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    />
  );
}
