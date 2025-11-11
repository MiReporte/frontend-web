"use client";

import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import ProtectedPage from "@/components/ProtectedPage";
import Profile from "@/assets/Profile.svg";
import LoadingImage from "@/components/LoadingImage";
import styles from "@/app/dashboard/profile/profilePage.module.css";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <LoadingImage />;
  }

  return (
    <ProtectedPage permission="perfil">
      <div className={styles.profileContainer}>
        <Image src={Profile} alt="Perfil" width={60} />
        <div className={styles.userInfo}>
          <p>
            {user.name} {user.first_surname}
          </p>
          <p>{user.email}</p>
        </div>
      </div>
      <div className={styles.userName}>
        <strong>Nombre</strong>
        <p>
          {user.name} {user.first_surname} {user.second_surname}
        </p>
      </div>
      <div className={styles.userEmail}>
        <strong>Correo Electrónico</strong>
        <p>{user.email}</p>
      </div>
    </ProtectedPage>
  );
}
