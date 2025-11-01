"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

/**
 * Component that renders an OpenStreetMap map using react-leaflet.
 * @returns JSX.Element - The map view component.
 */
const MapView: React.FC = () => {
  useEffect(() => {}, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        center={[19.4326, -99.1332]}
        zoom={18}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

export default MapView;
