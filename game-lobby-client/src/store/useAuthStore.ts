import { create } from "zustand";

export type AuthToken = {
  access_token: string;
};

type User = {
  userId: string;
  username: string;
  email: string;
  winHistory: string[];
};

type AuthState = {
  user: User | null;
  token: AuthToken | null;
  login: (user: User, token: AuthToken) => void;
  logout: () => void;
  setToken: (token: AuthToken | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setToken: (token) => set({ token }),
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
