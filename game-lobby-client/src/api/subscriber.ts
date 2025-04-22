import { create } from "zustand";
import { io } from "socket.io-client";
import {
  PlayerJoinedPayload,
  SessionEndedPayload,
  SessionStartedPayload,
  SocketState,
} from "../types";

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
