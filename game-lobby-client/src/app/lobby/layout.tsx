"use client";

import { useEffect } from "react";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { isTokenExpired } from "../../lib/utils";
import toast from "react-hot-toast";

export default function LobbyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useInactivityLogout(3);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const expired = isTokenExpired(token);

      if (expired) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.setItem("logout", Date.now().toString());
        window.location.href = "/";
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "logout" && localStorage.getItem("token")) {
        toast.error("You were logged out in another tab.");
        localStorage.removeItem("token");
        localStorage.removeItem("logout");
        window.location.href = "/";
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
