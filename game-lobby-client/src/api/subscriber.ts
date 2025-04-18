import { create } from "zustand";
import { io, Socket } from "socket.io-client";

type SessionStartedPayload = {
  endsAt: string;
  startedAt: string;
  nextSessionStartsAt: string;
};

type SessionEndedPayload = {
  winningNumber: number;
  winners: string[];
  nextSessionStartsAt: string;
};

type PlayerJoinedPayload = {
  players: {
    userId: string;
    username: string;
    pickedNumber: number;
  }[];
};

type SocketState = {
  socket: Socket | null;
  sessionStartedPayload: SessionStartedPayload | null;
  sessionEndedPayload: SessionEndedPayload | null;
  nextSessionStartsAt: Date | string | null;
  players: PlayerJoinedPayload["players"] | null;
  connect: () => void;
  disconnect: () => void;
  syncGameState: () => void;
};

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  sessionStartedPayload: null,
  sessionEndedPayload: null,
  nextSessionStartsAt: null,
  players: null,

  connect: () => {
    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL!}/game`, {
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("✅ Connected to Socket.IO server"));
    socket.on("connect", () => {
      console.log("✅ Connected to socket server");

      // Immediately request latest players when connected
      socket.emit("getPlayers");

      // Sync the game state once connected
      socket.emit("getGameState");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    socket.on("connect_error", (err) =>
      console.error("Connection error:", err)
    );

    // Log all events for debugging
    socket.onAny((event, ...args) => {
      console.log("📡 Received event:", event, args);
    });

    socket.on("sessionStarted", (payload: SessionStartedPayload) => {
      // console.log("🎉 Session started!", payload);

      // const now = Date.now();
      // const endsAt = new Date(payload.endsAt).getTime();
      // const startedAt = new Date(payload.startedAt).getTime();

      // const remaining = endsAt - now;
      // const totalDuration = endsAt - startedAt;
      // const progress = (totalDuration - remaining) / totalDuration;

      // console.log(`⏳ Remaining time: ${remaining}ms`);
      // console.log(`📊 Progress: ${(progress * 100).toFixed(1)}%`);

      set({ sessionStartedPayload: payload });
    });

    socket.on("sessionSkipped", (payload: { nextSessionStartsAt: string }) => {
      const nextStart = payload.nextSessionStartsAt;

      set((state) => ({
        nextSessionStartsAt: nextStart,
        sessionStartedPayload: state.sessionStartedPayload
          ? {
              ...state.sessionStartedPayload,
              nextSessionStartsAt: nextStart,
            }
          : null,
      }));
    });

    socket.on("sessionEnded", (payload: SessionEndedPayload) => {
      set({ sessionEndedPayload: payload });
    });

    socket.on("playersInLobby", (payload: PlayerJoinedPayload) => {
      set({ players: payload.players });
    });

    socket.on("gameState", (state) => {
      set({
        sessionStartedPayload: state?.sessionStartedPayload || null,
        sessionEndedPayload: state?.sessionEndedPayload || null,
        nextSessionStartsAt: state?.nextSessionStartsAt
          ? new Date(state.nextSessionStartsAt)
          : null,
        players: state?.players || null,
      });
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = useSocketStore.getState().socket;
    socket?.off("sessionStarted");
    socket?.off("sessionEnded");
    socket?.off("playerJoined");
    socket?.off("gameState");
    socket?.disconnect();

    set({
      socket: null,
      sessionStartedPayload: null,
      sessionEndedPayload: null,
      players: null,
    });
  },

  syncGameState: () => {
    const socket = useSocketStore.getState().socket;
    if (socket) {
      console.log("⏳ Syncing game state...");
      socket.emit("getGameState");
    }
  },
}));
