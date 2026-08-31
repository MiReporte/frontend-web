"use client";

interface AlertProps {
  messageTitle?: string;
  message: string;
  onClose: () => void;
}

export function Alert({ messageTitle, message, onClose }: AlertProps) {
  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold" style={{ color: "#611232" }}>
              {messageTitle || "Aviso"}
            </h5>
          </div>

          <div className="modal-body py-4 text-center">
            <p className="mb-0 fs-5 text-secondary">{message}</p>
          </div>

          <div className="modal-footer border-top-0 pt-0 justify-content-center">
            <button
              type="button"
              className="btn text-white rounded-pill px-5 fw-medium shadow-sm"
              style={{ backgroundColor: "#611232", border: "none" }}
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
