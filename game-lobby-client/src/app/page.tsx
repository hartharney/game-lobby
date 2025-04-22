"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/modal/AuthModal";
import { useSessionSocket } from "../hooks/useSessionSocket";

export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [path, setPath] = useState("");
  const { sessionEndedPayload } = useSessionSocket();

  const openModal = (path: string) => {
    setPath(path);
    setModalOpen(true);
  };

  const closeModal = () => {
    setPath("");
    setModalOpen(false);
  };

  return (
    <main className="min-h-screen overflow-x-hidden overflow-y-hidden bg-gradient-to-br from-[#2c2d59] to-[#1a1a2e] text-white flex flex-col relative p-6">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-72 h-72 bg-purple-600 opacity-30 rounded-full blur-3xl top-[-50px] left-[-50px]"></div>
        <div className="absolute w-72 h-72 bg-pink-500 opacity-20 rounded-full blur-3xl bottom-[-50px] right-[-50px]"></div>
      </div>

      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl w-full mx-auto relative">
        <div className="w-32 h-auto">
          <Image
            src="/images/logo.png"
            alt="Harneys game logo"
            width={128}
            height={64}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        <div className="hidden md:flex gap-6">
          <Link href="/leaderboard" className="hover:text-purple-300">
            Leaderboard
          </Link>
        </div>

        {/* Hamburger Button */}
        <button
          className="md:hidden text-2xl cursor-pointer z-50"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-21 left-0 w-full bg-[#2c2d59] flex flex-col gap-6 items-center py-6 md:hidden z-50">
          <Link href="/leaderboard" className="hover:text-purple-300 text-lg">
            Leaderboard
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-12 px-6 max-w-7xl w-full mx-auto">
        {/* Left Section */}
        <div className="max-w-xl space-y-6 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]">
            EMBARK ON AN EPIC JOURNEY <br />
            <span className="text-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.9)]">
              WHERE LEGENDS ARE MADE
            </span>
          </h1>

          <p className="text-lg text-gray-300">
            Dive into the mystical world of Harneys, will you rise to the
            challenge?
          </p>

          {sessionEndedPayload && (
            <p className="text-lg text-gray-300">
              The last session ended with the winning number{" "}
              <span className="font-bold text-purple-400">
                {sessionEndedPayload.winningNumber}
              </span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start z-100">
            <button
              className="px-6 py-3 bg-white text-black rounded-[10px] font-semibold w-[200px] cursor-pointer z-200"
              onClick={() => openModal("/register")}
            >
              Join the Adventure
            </button>

            <button
              className="px-6 py-3 border border-white rounded-[10px] font-semibold w-[200px] cursor-pointer z-200"
              onClick={() => router.push("/lobby")}
            >
              Start Playing
            </button>
          </div>
        </div>

        {/* Right Section */}
        <motion.div
          initial={{ x: 0, y: 0 }}
          animate={{
            x: [0, 20, 40, 20, 0, -20, -40, -20, 0],
            y: [0, 20, 0, -20, -40, -20, 0, 20, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="w-full max-w-md"
        >
          <Image
            src="/images/surfing_harney.png"
            alt="Harneys Character"
            width={500}
            height={500}
            className="w-full h-auto object-contain"
            priority
          />
        </motion.div>
      </div>

      {/* Show Modal if open */}
      {modalOpen && <AuthModal closeModal={closeModal} path={path} />}
    </main>
  );
}
