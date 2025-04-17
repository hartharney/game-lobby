"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthModal from "../modal/AuthModal";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !localStorage.getItem("token")) {
      setIsModalOpen(true);
    }
  }, [isMounted]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push("/");
  };

  if (!isMounted) return null;

  if (!localStorage.getItem("token") && isModalOpen)
    return <AuthModal path="/login" closeModal={handleCloseModal} />;

  return <>{children}</>;
}
