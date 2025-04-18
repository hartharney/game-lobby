import { AxiosError } from "axios";
import { Socket } from "socket.io-client";

export interface Winner {
  userId: string;
  username: string;
  pickedNumber: number;
}

export type SessionStartedPayload = {
  endsAt: string;
  startedAt: string;
  nextSessionStartsAt: string;
};

export type SessionEndedPayload = {
  winningNumber: number;
  winners: Winner[];
  nextSessionStartsAt: string;
};

export type PlayerJoinedPayload = {
  players: {
    userId: string;
    username: string;
    pickedNumber: number;
  }[];
};

export type SocketState = {
  socket: Socket | null;
  sessionStartedPayload: SessionStartedPayload | null;
  sessionEndedPayload: SessionEndedPayload | null;
  nextSessionStartsAt: Date | string | null;
  players: PlayerJoinedPayload["players"] | null;
  connect: () => void;
  disconnect: () => void;
  syncGameState: () => void;
};

export type ApiError = AxiosError<{
  message?: { message?: string };
}>;

export type AuthToken = {
  access_token: string;
};

export type User = {
  _id: string;
  username: string;
  email: string;
  winHistory: string[];
};

export type LoginResponse = {
  data: {
    token: AuthToken;
    user: User;
  };
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};
