"use client";

interface ConfirmUpdateProps {
  messageTitle?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmUpdate({
  messageTitle,
  message,
  onConfirm,
  onCancel,
}: ConfirmUpdateProps) {
  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold text-dark">
              {messageTitle || "Confirmación"}
            </h5>
          </div>

          <div className="modal-body py-4">
            <p className="mb-0 text-secondary fs-6">{message}</p>
          </div>

          <div className="modal-footer border-top-0 pt-0">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn text-white rounded-pill px-4 shadow-sm"
              style={{ backgroundColor: "#611232", border: "none" }}
              onClick={onConfirm}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
