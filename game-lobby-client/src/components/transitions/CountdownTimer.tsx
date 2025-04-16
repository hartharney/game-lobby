"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type CountdownTimerProps = {
  duration: number;
};

export const CountdownTimer = ({ duration }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const update = () => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    };

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSessionEnd = () => {
    // Play sound
    // const audio = new Audio("/sounds/notification.mp3");
    // audio.play().catch(console.error);

    // Trigger device vibration (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(300);
    }
  };

  const percent = Math.max(0, Math.min(100, (timeLeft / duration) * 100));

  const getBarColor = () => {
    if (percent > 66) return "bg-green-500";
    if (percent > 33) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="space-y-2 w-full max-w-lg">
      <div className="flex flex-col justify-center items-center gap-2">
        <div className="flex justify-between items-center text-lg font-semibold">
          <p className="font-mono text-xl bg-black/30 rounded px-3 py-1">
            {formatTime(timeLeft)}
          </p>
        </div>
        <div className="w-full h-5 bg-gray-300 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getBarColor()}`}
            initial={{ width: "100%" }}
            animate={{ width: `${percent}%` }}
            transition={{ ease: "linear", duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};
