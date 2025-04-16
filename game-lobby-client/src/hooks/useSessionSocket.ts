import { useSocketStore } from "@/api/subscriber";
import { useEffect, useState } from "react";

export const useSessionSocket = () => {
  const { socket, connect } = useSocketStore();
  const [session, setSession] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (!socket) return;

    socket.on("sessionUpdate", (data) => {
      setSession(data);
    });

    socket.on("countdown", (timeLeft) => {
      setCountdown(timeLeft);
    });

    return () => {
      socket.off("sessionUpdate");
      socket.off("countdown");
    };
  }, [socket]);

  return { session, countdown };
};
