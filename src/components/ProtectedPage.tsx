"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { rolePermissions } from "@/lib/permissions";

type ProtectedPageProps = {
  permission: string;
  children: ReactNode;
};

export default function ProtectedPage({
  permission,
  children,
}: ProtectedPageProps) {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  const isClient = typeof window !== "undefined";

  useEffect(() => {
    if (
      isClient &&
      (!isLoggedIn ||
        user?.role === "usuario_ciudadano" ||
        !rolePermissions[user!.role]?.includes(permission))
    ) {
      router.push("/dashboard");
    }
  }, [isClient, isLoggedIn, user, permission, router]);

  if (!isClient || !isLoggedIn || !user) return null;

  return <>{children}</>;
}
