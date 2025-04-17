"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  duration: number;
};

export const CountdownTimer = ({ duration }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  const handleSessionEnd = () => {
    if (navigator.vibrate) {
      navigator.vibrate(300);
    }
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
      </div>
    </div>
  );
};
