import { create } from "zustand";

type User = {
  userId: string;
  username: string;
  email: string;
  winHistory: string[];
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setToken: (token) => set({ token }),
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
