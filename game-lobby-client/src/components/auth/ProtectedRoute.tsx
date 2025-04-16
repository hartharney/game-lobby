"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthModal from "../modal/AuthModal";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setIsModalOpen(true);
    }
  }, [user]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push("/");
  };

  if (!user && isModalOpen)
    return <AuthModal path="/login" closeModal={handleCloseModal} />;

  return <>{children}</>;
}
