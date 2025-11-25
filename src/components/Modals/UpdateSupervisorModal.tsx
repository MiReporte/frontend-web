"use client";

import { useEffect, useState } from "react";
import type { SupervisorsResponse } from "@/utils/types";
import { getSupervisors } from "@/services/getSupervisors";
import { useAuth } from "@/hooks/useAuth";
import { updateSupervisorReport } from "@/services/updateSupervisorReport";
import Image from "next/image";
import Profile from "@/assets/ProfileActive.svg";

interface UpdateSupervisorProps {
  reportId: number;
  supervisorId: number | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function UpdateSupervisorModal({
  reportId,
  supervisorId,
  onClose,
  onUpdated,
}: UpdateSupervisorProps) {
  const { user } = useAuth();
  const [supervisors, setSupervisors] = useState<SupervisorsResponse[]>([]);

  const [selectedSupervisor, setSelectedSupervisor] = useState<number | null>(
    supervisorId
  );

  const [currentSupervisorId, setCurrentSupervisorId] = useState<number | null>(
    supervisorId
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await getSupervisors(user.token);
        setSupervisors(data);
        setLoading(false);
      } catch (err) {
        setError(`Error al cargar supervisores: ${err}`);
        setLoading(false);
      }
    };

    fetchSupervisors();
  }, [user]);

  const updateSupervisor = async () => {
    if (!user || selectedSupervisor === null) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await updateSupervisorReport(
        { report_id: reportId, assigned_supervisor: selectedSupervisor },
        user.token
      );

      setCurrentSupervisorId(selectedSupervisor);

      setSuccessMessage("Supervisor actualizado correctamente.");
      onUpdated();
      setSaving(false);
    } catch (err) {
      setError("No se pudo actualizar el supervisor.");
      setSaving(false);
    }
  };

  const brandColor = "#611232";

  const filteredSupervisors = supervisors.filter(
    (sup) =>
      sup.account_id.toString().includes(searchTerm) ||
      sup.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content border-0 shadow rounded-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header border-bottom-0 pb-0">
            <h4 className="modal-title fw-bold" style={{ color: brandColor }}>
              Asignar Supervisor Técnico
            </h4>
          </div>

          <div className="modal-body px-4 py-2">
            {loading ? (
              <div className="text-center py-5 text-muted">
                Cargando lista de supervisores...
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <div className="container-fluid">
                <div className="row mb-4">
                  <div className="col-12">
                    <div
                      className="p-3 rounded-3 d-flex align-items-center gap-3"
                      style={{
                        backgroundColor: "#FFF8E1",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <div
                        className="d-flex justify-content-center align-items-center bg-white rounded-circle p-2 shadow-sm"
                        style={{ width: 50, height: 50 }}
                      >
                        <span className="fs-4">👷</span>
                      </div>
                      <div>
                        <p
                          className="mb-0 small text-uppercase fw-bold text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Supervisor Actual
                        </p>
                        <h5 className="mb-0 fw-bold text-dark">
                          {currentSupervisorId !== null
                            ? supervisors.find(
                                (sup) => sup.account_id === currentSupervisorId
                              )?.name || "Desconocido"
                            : "Sin asignar"}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-end mb-2">
                      <p className="small text-muted mb-0 fw-bold">
                        SELECCIONAR DE LA LISTA
                      </p>

                      <div
                        className="input-group input-group-sm"
                        style={{ maxWidth: "250px" }}
                      >
                        <input
                          type="text"
                          className="form-control bg-light border-start-0"
                          placeholder="Buscar por ID o Nombre..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div
                      className="overflow-auto no-scrollbar pe-2"
                      style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        overflowX: "hidden",
                      }}
                    >
                      <div className="row g-2">
                        {filteredSupervisors.length > 0 ? (
                          filteredSupervisors.map((sup) => {
                            const isSelected =
                              selectedSupervisor === sup.account_id;
                            return (
                              <div
                                className="col-12 col-md-6"
                                key={sup.account_id}
                              >
                                <div
                                  onClick={() =>
                                    setSelectedSupervisor(sup.account_id)
                                  }
                                  className="d-flex align-items-center p-3 rounded-3 h-100 position-relative transition-all"
                                  style={{
                                    cursor: "pointer",
                                    backgroundColor: isSelected
                                      ? "#fff5f5"
                                      : "#fff",
                                    border: isSelected
                                      ? `2px solid ${brandColor}`
                                      : "1px solid #e0e0e0",
                                  }}
                                >
                                  {isSelected && (
                                    <div
                                      className="position-absolute top-0 end-0 mt-2 me-2 text-success"
                                      style={{ fontSize: "0.8rem" }}
                                    ></div>
                                  )}

                                  <div className="d-flex align-items-center gap-3 w-100">
                                    <div
                                      className="position-relative flex-shrink-0"
                                      style={{ width: 48, height: 48 }}
                                    >
                                      <Image
                                        src={sup.image || Profile}
                                        alt="Profile"
                                        fill
                                        className="rounded-circle object-fit-cover border"
                                      />
                                    </div>
                                    <div
                                      className="flex-grow-1"
                                      style={{ minWidth: 0 }}
                                    >
                                      <p
                                        className="mb-0 fw-bold text-dark text-truncate"
                                        title={`${sup.name} ${sup.first_surname}`}
                                      >
                                        {sup.name} {sup.first_surname}
                                      </p>
                                      <div className="d-flex justify-content-between align-items-center mt-1">
                                        <span
                                          className="badge bg-light text-dark border fw-normal"
                                          style={{ fontSize: "0.75rem" }}
                                        >
                                          ID: {sup.account_id}
                                        </span>
                                        <span
                                          className="small text-muted"
                                          style={{ fontSize: "0.75rem" }}
                                        >
                                          {sup.counted_reports} Reportes
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-12 text-center py-4 text-muted">
                            No se encontraron supervisores con ese ID.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {successMessage && (
            <div className="px-4">
              <div className="alert alert-success text-center py-2 mb-0 d-flex align-items-center justify-content-center gap-2">
                {successMessage}
              </div>
            </div>
          )}

          <div className="modal-footer border-top-0 pt-3 pb-4 justify-content-center gap-3">
            <button
              className="btn btn-outline-secondary rounded-pill px-5 fw-medium"
              onClick={onClose}
            >
              {successMessage ? "Salir" : "Cancelar"}
            </button>

            <button
              className="btn text-white rounded-pill px-5 fw-bold shadow-sm"
              style={{ backgroundColor: brandColor, border: "none" }}
              onClick={updateSupervisor}
              disabled={
                saving ||
                selectedSupervisor === null ||
                (successMessage !== null &&
                  selectedSupervisor === currentSupervisorId)
              }
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Guardando...
                </>
              ) : (
                "Asignar Supervisor"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
