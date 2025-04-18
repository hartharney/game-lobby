import { useSocketStore } from "@/api/subscriber";
import { useEffect } from "react";

export const useSessionSocket = () => {
  const {
    connect,
    disconnect,
    players,
    sessionStartedPayload,
    sessionEndedPayload,
    nextSessionStartsAt,
    socket,
  } = useSocketStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    sessionStartedPayload,
    sessionEndedPayload,
    nextSessionStartsAt,
    players,
    socket,
  };
};
