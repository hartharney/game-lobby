import { create } from "zustand";
import { io, Socket } from "socket.io-client";

type SessionStartedPayload = {
  endsAt: string;
  nextSessionStartsAt: string;
};

type SessionEndedPayload = {
  winningNumber: number;
  winners: any[];
  nextSessionStartsAt: string;
};

type SocketState = {
  socket: Socket | null;
  sessionStartedPayload: SessionStartedPayload | null;
  sessionEndedPayload: SessionEndedPayload | null;
  connect: () => void;
  disconnect: () => void;
};

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  sessionStartedPayload: null,
  sessionEndedPayload: null,

  connect: () => {
    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL!}/game`, {
      transports: ["websocket"],
    });

    console.log("Connecting to Socket.IO server...", socket);

    socket.on("connect", () => console.log("✅ Connected to Socket.IO server"));
    socket.on("disconnect", () => console.log("❌ Disconnected from server"));
    socket.on("connect_error", (err) =>
      console.error("Connection error:", err)
    );

    // Log all events for debugging
    socket.onAny((event, ...args) => {
      console.log("📡 Received event:", event, args);
    });

    socket.on("sessionStarted", (payload: SessionStartedPayload) => {
      console.log("🎉 Session started!", payload);
      set({ sessionStartedPayload: payload });
    });

    socket.on("sessionEnded", (payload: SessionEndedPayload) => {
      console.log("🏁 Session ended!", payload);
      set({ sessionEndedPayload: payload });
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = useSocketStore.getState().socket;
    socket?.disconnect();
    set({
      socket: null,
      sessionStartedPayload: null,
      sessionEndedPayload: null,
    });
  },
}));
