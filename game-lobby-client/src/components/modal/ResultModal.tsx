import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Winner } from "@/types";

interface ResultModalProps {
  step: "result-win" | "result-lose" | null;
  winningNumber: number;
  winners: Winner[];
  onClose: () => void;
}
const fireConfetti = () => {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
};

const ResultModal: React.FC<ResultModalProps> = ({
  step,
  winningNumber,
  winners,
  onClose,
}) => {
  const isWin = step === "result-win";

  useEffect(() => {
    if (isWin) fireConfetti();
  }, [isWin]);

  if (!step) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="text-center">
            <h1
              className={`text-4xl font-bold ${
                isWin ? "text-green-600" : "text-red-600"
              }`}
            >
              {isWin ? "🎉 You won!" : "😔 Better luck next time!"}
            </h1>
            <p className="text-lg mt-2 text-black">
              Winning Number:{" "}
              <span
                className={`font-bold ${
                  isWin ? "text-green-400" : "text-red-400"
                }`}
              >
                {winningNumber}
              </span>
            </p>
            <div className="mt-4">
              <h2 className="text-xl text-black">🏆 Winners:</h2>
              <ul className="mt-2 space-y-1">
                {winners.map((winner, index) => (
                  <li key={index} className="text-black">
                    - {winner.username}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-blue-500 text-black rounded-[20px]"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultModal;
