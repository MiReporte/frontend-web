"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import ProtectedPage from "@/components/ProtectedPage";
import LoadingImage from "@/components/LoadingImage";
import { ChangeImageModal } from "@/components/Modals/ChangeImageModal";
import { ChangePasswordModal } from "@/components/Modals/ChangePasswordModal";
import { ChangeEmailModal } from "@/components/Modals/ChangeEmailModal";
import styles from "@/app/dashboard/profile/profile.module.css";

export default function ProfilePage() {
  return (
    <ProtectedPage permission="perfil">
      <ProfileInner />
    </ProtectedPage>
  );
}

function ProfileInner() {
  const { user, logout, updateUser } = useAuth();

  const [showImageModal, setShowImageModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  if (!user) {
    return <LoadingImage />;
  }

  const initial = user.name?.charAt(0)?.toUpperCase() || "?";

  const fullName = [user.name, user.first_surname, user.second_surname]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="container-fluid py-4 px-lg-4">
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className={styles.hero}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={fullName}
                    width={96}
                    height={96}
                    className={styles.avatarImg}
                  />
                ) : (
                  <div className={styles.avatarInitials}>{initial}</div>
                )}
              </div>
              <button
                type="button"
                className={styles.avatarEditBtn}
                onClick={() => setShowImageModal(true)}
                title="Cambiar foto de perfil"
              >
                <i className="bi bi-pencil-fill"></i>
              </button>
            </div>

            <h2 className={styles.heroName}>{fullName}</h2>
            <p className={styles.heroEmail}>
              <i className="bi bi-envelope"></i>
              {user.email}
            </p>

            <div className={styles.divider}></div>

            <button type="button" onClick={logout} className={styles.logoutButton}>
              <i className="bi bi-box-arrow-right"></i>
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className={styles.detailsCard}>
            <h2 className={styles.detailsTitle}>Información de la cuenta</h2>

            <div className={styles.fieldGrid}>
              <div className={`${styles.field} ${styles.spanAll}`}>
                <span className={styles.fieldLabel}>
                  <i className="bi bi-person"></i>
                  Nombre completo
                </span>
                <span className={styles.fieldValue}>{fullName}</span>
              </div>

              <div className={styles.field}>
                <div className={styles.fieldHeader}>
                  <span className={styles.fieldLabel}>
                    <i className="bi bi-envelope"></i>
                    Correo electrónico
                  </span>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => setShowEmailModal(true)}
                    title="Cambiar correo electrónico"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </div>
                <span className={styles.fieldValue}>{user.email}</span>
              </div>

              <div className={styles.field}>
                <div className={styles.fieldHeader}>
                  <span className={styles.fieldLabel}>
                    <i className="bi bi-key"></i>
                    Contraseña
                  </span>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => setShowPasswordModal(true)}
                    title="Cambiar contraseña"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </div>
                <span className={styles.fieldValue}>••••••••</span>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>
                  <i className="bi bi-shield-check"></i>
                  Rol
                </span>
                <span className={styles.fieldValue}>{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showImageModal && (
        <ChangeImageModal
          onClose={() => setShowImageModal(false)}
          onUpdated={(newImageUrl) => {
            updateUser({ image: newImageUrl });
            setShowImageModal(false);
          }}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      {showEmailModal && (
        <ChangeEmailModal
          currentEmail={user.email}
          onClose={() => setShowEmailModal(false)}
          onUpdated={(newEmail) => {
            updateUser({ email: newEmail });
            setShowEmailModal(false);
          }}
        />
      )}
    </div>
  );
}