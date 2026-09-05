"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { ReportMapPoint } from "@/utils/types";

interface ReportsMapProps {
  points: ReportMapPoint[];
  loading?: boolean;
  selectedType?: "BACHE" | "ALUM" | null;
  newReportPing?: ReportMapPoint | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  REVISION: { bg: "#F59E0B", text: "#fff", label: "En Revisión" },
  APROBADO: { bg: "#16A34A", text: "#fff", label: "Aprobado" },
  PROCESO: { bg: "#EA580C", text: "#fff", label: "En Proceso" },
  COMPLETADO: { bg: "#2563EB", text: "#fff", label: "Completado" },
  CIERRE: { bg: "#9333EA", text: "#fff", label: "Cerrado" },
  NO_APROBADO: { bg: "#DC2626", text: "#fff", label: "No Aprobado" },
};

export default function ReportsMap({
  points,
  loading = false,
  selectedType = null,
  newReportPing = null,
}: ReportsMapProps) {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pingMarkerRef = useRef<L.CircleMarker | null>(null);

  const [viewMode, setViewMode] = useState<"heatmap" | "markers">("heatmap");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sanitizar coordenadas y filtrar puntos válidos
  const validPoints = useMemo(() => {
    return points
      .map((p) => ({
        ...p,
        latitude:
          typeof p.latitude === "string" ? parseFloat(p.latitude) : p.latitude,
        longitude:
          typeof p.longitude === "string"
            ? parseFloat(p.longitude)
            : p.longitude,
      }))
      .filter(
        (p) =>
          typeof p.latitude === "number" &&
          typeof p.longitude === "number" &&
          !isNaN(p.latitude) &&
          !isNaN(p.longitude) &&
          p.latitude !== 0 &&
          p.longitude !== 0
      );
  }, [points]);

  // Filtrar los puntos según el tipo si aplica
  const filteredPoints = useMemo(() => {
    if (!selectedType) return validPoints;
    return validPoints.filter((p) => {
      const t = (p.typereport || "").toUpperCase();
      if (selectedType === "BACHE") return t.includes("BACH");
      if (selectedType === "ALUM") return t.includes("ALUM");
      return true;
    });
  }, [validPoints, selectedType]);

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Coordenadas por defecto iniciales
    const defaultCenter: [number, number] = [19.4326, -99.1332];
    const initialCenter: [number, number] =
      points.length > 0
        ? [points[0].latitude, points[0].longitude]
        : defaultCenter;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
    });

    // Capa base elegante de OpenStreetMap / CartoDB Voyager
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    // Controles de zoom en la esquina superior derecha
    L.control.zoom({ position: "topright" }).addTo(map);

    // Capa de marcadores
    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on("popupopen", (e) => {
      const popupNode = e.popup.getElement();
      if (!popupNode) return;
      const btn = popupNode.querySelector<HTMLAnchorElement>(
        ".btn-view-report-detail"
      );
      if (btn) {
        btn.onclick = (evt) => {
          evt.preventDefault();
          const repId = btn.getAttribute("data-report-id");
          if (repId) {
            routerRef.current.push(`/dashboard/reportes?report_id=${repId}`);
          }
        };
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      heatLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Actualizar capas según filteredPoints y viewMode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 2. Limpiar marcadores previos
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    if (filteredPoints.length === 0) {
      // Sin puntos: quitar la capa de calor si existe
      if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
      heatLayerRef.current = null;
      return;
    }

    const heatData: Array<[number, number, number]> = filteredPoints.map(
      (p) => [p.latitude, p.longitude, 0.8]
    );

    if (viewMode === "heatmap") {
      // Reutilizar la capa de calor existente para evitar redibujados
      // que disparan el error "_leaflet_pos is undefined".
      const existingHeat = heatLayerRef.current as
        | (L.Layer & { setLatLngs(latlngs: Array<[number, number, number]>): unknown })
        | null;

      if (existingHeat && map.hasLayer(existingHeat)) {
        try {
          existingHeat.setLatLngs(heatData);
        } catch (err) {
          console.warn("Error al actualizar el mapa de calor:", err);
          try {
            if (map.hasLayer(existingHeat)) map.removeLayer(existingHeat);
          } catch {
            /* noop */
          }
          heatLayerRef.current = null;
        }
      } else if (L.heatLayer) {
        try {
          heatLayerRef.current = L.heatLayer(heatData, {
            radius: 28,
            blur: 18,
            maxZoom: 17,
            max: 1.0,
            gradient: {
              0.2: "#3B82F6", // Azul
              0.4: "#10B981", // Verde
              0.6: "#FBBF24", // Amarillo
              0.8: "#F97316", // Naranja
              1.0: "#EF4444", // Rojo intenso
            },
          }).addTo(map);
        } catch (err) {
          console.warn("Error al dibujar el mapa de calor:", err);
          heatLayerRef.current = null;
        }
      }
    } else {
      // Quitar la capa de calor al pasar a modo marcadores
      if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
      heatLayerRef.current = null;
      // Modo Marcadores interactivos
      filteredPoints.forEach((point) => {
        const isBache =
          point.typereport?.toUpperCase() === "BACHE" ||
          point.typereport?.toUpperCase() === "BACHEO";

        const statusInfo =
          STATUS_COLORS[point.status?.toUpperCase()] || {
            bg: "#6B7280",
            text: "#fff",
            label: point.status || "Desconocido",
          };

        const iconHtml = `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${isBache ? "#4F46E5" : "#D97706"};
            color: #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            font-size: 14px;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <i class="bi ${isBache ? "bi-water" : "bi-lightbulb-fill"}"></i>
            <span style="
              position: absolute;
              bottom: -2px;
              right: -2px;
              width: 10px;
              height: 10px;
              background-color: ${statusInfo.bg};
              border: 1.5px solid #ffffff;
              border-radius: 50%;
            "></span>
          </div>
        `;

        const customDivIcon = L.divIcon({
          html: iconHtml,
          className: "custom-report-pin",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const formattedDate = point.date
          ? new Date(point.date).toLocaleString("es-MX", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "Sin fecha";

        const popupContent = `
          <div style="font-family: inherit; font-size: 0.88rem; min-width: 220px; line-height: 1.4;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px;">
              <span style="font-weight: 700; color: #1f2937;">Reporte #${point.report_id}</span>
              <span style="background: ${isBache ? "#EEF2FF" : "#FEF3C7"}; color: ${isBache ? "#4338CA" : "#B45309"}; font-size: 0.72rem; padding: 2px 7px; border-radius: 9999px; font-weight: 600;">
                ${isBache ? "Bache" : "Alumbrado"}
              </span>
            </div>
            ${
              point.problem
                ? `<p style="margin: 0 0 4px 0; font-weight: 600; color: #374151;">${point.problem}</p>`
                : ""
            }
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 0.8rem;">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i> ${point.neighborhood || "Sin colonia"}
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; margin-bottom: 8px;">
              <span style="background-color: ${statusInfo.bg}; color: ${statusInfo.text}; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 500;">
                ${statusInfo.label}
              </span>
              <span style="font-size: 0.75rem; color: #9ca3af;">${formattedDate}</span>
            </div>
            <div style="border-top: 1px solid #f3f4f6; padding-top: 8px; margin-top: 6px;">
              <a
                href="/dashboard/reportes?report_id=${point.report_id}"
                data-report-id="${point.report_id}"
                class="btn-view-report-detail"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                  width: 100%;
                  background-color: #611232;
                  color: #ffffff;
                  padding: 7px 12px;
                  border-radius: 6px;
                  font-size: 0.8rem;
                  font-weight: 600;
                  text-decoration: none;
                  box-sizing: border-box;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                  transition: background-color 0.2s ease, transform 0.1s ease;
                  cursor: pointer;
                "
                onmouseover="this.style.backgroundColor='#4a0d26'"
                onmouseout="this.style.backgroundColor='#611232'"
              >
                <i class="bi bi-box-arrow-up-right" style="font-size: 0.75rem;"></i>
                Ver detalle del reporte
              </a>
            </div>
          </div>
        `;

        const marker = L.marker([point.latitude, point.longitude], {
          icon: customDivIcon,
        }).bindPopup(popupContent);

        if (markersLayerRef.current) {
          markersLayerRef.current.addLayer(marker);
        }
      });
    }

    if (filteredPoints.length > 0) {
      const validCoords = filteredPoints.filter(
        (p) =>
          Number.isFinite(Number(p.latitude)) &&
          Number.isFinite(Number(p.longitude))
      );
      if (validCoords.length > 0) {
        try {
          const bounds = L.latLngBounds(
            validCoords.map((p) => [Number(p.latitude), Number(p.longitude)])
          );
          map.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 15,
            animate: true,
          });
        } catch (err) {
          console.warn("Error al ajustar los límites del mapa:", err);
        }
      }
    }
  }, [filteredPoints, viewMode]);

  // Manejo de pulso en vivo para nuevos reportes vía WebSocket
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !newReportPing?.latitude || !newReportPing?.longitude) return;

    if (pingMarkerRef.current && map.hasLayer(pingMarkerRef.current)) {
      map.removeLayer(pingMarkerRef.current);
    }
    pingMarkerRef.current = null;

    const pingCircle = L.circleMarker(
      [newReportPing.latitude, newReportPing.longitude],
      {
        radius: 20,
        color: "#EF4444",
        fillColor: "#F87171",
        fillOpacity: 0.6,
        weight: 3,
      }
    ).addTo(map);

    pingMarkerRef.current = pingCircle;

    // Enfocar el nuevo reporte solo si está fuera de la vista actual,
    // evitando chocar con el redibujado de la capa de calor.
    const lat = Number(newReportPing.latitude);
    const lng = Number(newReportPing.longitude);
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      !map.getBounds().contains([lat, lng])
    ) {
      map.setView([lat, lng], Math.max(map.getZoom(), 15), {
        animate: true,
        duration: 0.8,
      });
    }

    const timeout = setTimeout(() => {
      if (pingMarkerRef.current && map) {
        if (map.hasLayer(pingMarkerRef.current)) {
          map.removeLayer(pingMarkerRef.current);
        }
        pingMarkerRef.current = null;
      }
    }, 6000);

    return () => clearTimeout(timeout);
  }, [newReportPing]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map || filteredPoints.length === 0) return;
    const validCoords = filteredPoints.filter(
      (p) =>
        Number.isFinite(Number(p.latitude)) &&
        Number.isFinite(Number(p.longitude))
    );
    if (validCoords.length === 0) return;
    try {
      const bounds = L.latLngBounds(
        validCoords.map((p) => [Number(p.latitude), Number(p.longitude)])
      );
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    } catch (err) {
      console.warn("Error al re-centrar el mapa:", err);
    }
  };

  return (
    <div
      className={`card border-0 shadow-sm overflow-hidden position-relative ${
        isFullscreen ? "position-fixed top-0 start-0 w-100 h-100" : ""
      }`}
      style={{
        zIndex: isFullscreen ? 1050 : 1,
        borderRadius: isFullscreen ? 0 : "1rem",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header flotante del mapa */}
      <div className="card-header bg-white border-0 py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary"
            style={{ width: "38px", height: "38px" }}
          >
            <i className="bi bi-geo-alt-fill fs-5"></i>
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>
              Mapa de Incidencias en Tiempo Real
            </h5>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span
                className="d-inline-block rounded-circle bg-success"
                style={{
                  width: "8px",
                  height: "8px",
                  boxShadow: "0 0 0 3px rgba(22, 163, 74, 0.25)",
                }}
              ></span>
              <small className="text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                En vivo &bull; {filteredPoints.length} reporte(s) en la zona
              </small>
            </div>
          </div>
        </div>

        {/* Controles de visualización y acciones */}
        <div className="d-flex align-items-center gap-2">
          {/* Switch de Modo: Calor vs Marcadores */}
          <div className="btn-group btn-group-sm bg-light p-1 rounded-3 shadow-none border" role="group">
            <button
              type="button"
              onClick={() => setViewMode("heatmap")}
              className={`btn btn-sm rounded-2 fw-medium ${
                viewMode === "heatmap"
                  ? "btn-dark shadow-sm"
                  : "btn-light text-muted border-0"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              <i className="bi bi-fire text-danger me-1"></i> Mapa de Calor
            </button>
            <button
              type="button"
              onClick={() => setViewMode("markers")}
              className={`btn btn-sm rounded-2 fw-medium ${
                viewMode === "markers"
                  ? "btn-dark shadow-sm"
                  : "btn-light text-muted border-0"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              <i className="bi bi-geo-fill text-primary me-1"></i> Marcadores
            </button>
          </div>

          {/* Botón Re-centrar */}
          <button
            type="button"
            onClick={handleRecenter}
            className="btn btn-sm btn-outline-secondary rounded-3"
            title="Re-centrar mapa"
            style={{ width: "34px", height: "34px", padding: 0 }}
          >
            <i className="bi bi-crosshair"></i>
          </button>

          {/* Botón Pantalla Completa */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="btn btn-sm btn-outline-secondary rounded-3"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            style={{ width: "34px", height: "34px", padding: 0 }}
          >
            <i className={`bi ${isFullscreen ? "bi-fullscreen-exit" : "bi-arrows-fullscreen"}`}></i>
          </button>
        </div>
      </div>

      {/* Contenedor del Mapa */}
      <div className="card-body p-0 position-relative">
        {loading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
            style={{ zIndex: 1000 }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando mapa...</span>
            </div>
          </div>
        )}

        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: isFullscreen ? "calc(100vh - 70px)" : "420px",
            zIndex: 10,
          }}
        />

        {/* Leyenda flotante en la esquina inferior izquierda */}
        <div
          className="position-absolute bg-white p-2 px-3 rounded-3 shadow-sm border"
          style={{
            bottom: "16px",
            left: "16px",
            zIndex: 1000,
            fontSize: "0.78rem",
            maxWidth: "240px",
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
          }}
        >
          {viewMode === "heatmap" ? (
            <div>
              <div className="fw-bold mb-1 text-dark">Intensidad de Reportes</div>
              <div
                style={{
                  height: "8px",
                  borderRadius: "4px",
                  background:
                    "linear-gradient(to right, #3B82F6, #10B981, #FBBF24, #F97316, #EF4444)",
                  marginBottom: "4px",
                }}
              />
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.7rem" }}>
                <span>Baja</span>
                <span>Media</span>
                <span>Alta</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="fw-bold mb-1 text-dark">Tipo de Incidencia</div>
              <div className="d-flex align-items-center gap-3">
                <span className="d-flex align-items-center gap-1">
                  <span
                    className="rounded-circle d-inline-block"
                    style={{ width: "10px", height: "10px", backgroundColor: "#4F46E5" }}
                  ></span>
                  Bache
                </span>
                <span className="d-flex align-items-center gap-1">
                  <span
                    className="rounded-circle d-inline-block"
                    style={{ width: "10px", height: "10px", backgroundColor: "#D97706" }}
                  ></span>
                  Alumbrado
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
