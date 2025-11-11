import Image from "next/image";
import LoadingIcon from "@/assets/LoadingIcon.svg";
import styles from "./LoadingImage.module.css";

export default function LoadingImage() {
  return (
    <div className={styles.loadingContainer}>
      <Image src={LoadingIcon} alt="Cargando..." width={24} height={24} />
    </div>
  );
}
