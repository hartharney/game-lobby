import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// --- TYPES ---
type ApiError = AxiosError<{
  message?: { message?: string };
}>;

type AuthToken = {
  access_token: string;
};

type User = {
  _id: string;
  username: string;
  email: string;
  winHistory: string[];
};

type LoginResponse = {
  data: {
    token: AuthToken;
    user: User;
  };
};

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

type LoginPayload = {
  username: string;
  password: string;
};

// --- START SESSION ---
export const useStartSession = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: async () => {
      try {
        const res = await api.post("/game/start-session");
        return res.data;
      } catch (error) {
        const serverMessage = (error as ApiError).response?.data?.message
          ?.message;
        throw new Error(serverMessage || "Failed to start session!");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeSession"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start session!");
    },
  });
};

// --- JOIN LOBBY ---
export const useJoinLobby = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, number>({
    mutationFn: async (selectedNumber) => {
      try {
        const token = localStorage.getItem("token");

        if (typeof token !== "string") {
          throw new Error("Authorization token is missing!");
        }

        const res = await api.post(
          "/game/join-lobby",
          {
            pickedNumber: selectedNumber,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return res.data;
      } catch (error) {
        const serverMessage = (error as ApiError).response?.data?.message
          ?.message;
        throw new Error(serverMessage || "Failed to join lobby!");
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeLobby"] });
    },

    onError: (error) => {
      // Custom error handling based on message
      if (
        error.message.includes("Authorization") ||
        error.message.includes("token") ||
        error.message.includes("Unauthorized")
      ) {
        toast.error("Authorization failed, please log in again.");
      } else {
        toast.error(error.message || "Failed to join lobby!");
      }
    },
  });
};

// --- REGISTER ---
export const useRegister = () => {
  return useMutation<unknown, Error, RegisterPayload>({
    mutationFn: async (data) => {
      try {
        const res = await api.post("/auth/register", data);
        return res.data;
      } catch (error) {
        const serverMessage = (error as ApiError).response?.data?.message
          ?.message;
        throw new Error(serverMessage || "Registration failed!");
      }
    },
    onSuccess: () => {
      toast.success("Registration successful!");
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed!");
    },
  });
};

// --- LOGIN ---
export const useLogin = () => {
  const loginUser = useAuthStore((state) => state.login);

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: async (data) => {
      try {
        const res = await api.post("/auth/login", data);
        return res.data;
      } catch (error) {
        const serverMessage = (error as ApiError).response?.data?.message
          ?.message;
        throw new Error(serverMessage || "Login failed!");
      }
    },
    onSuccess: (data) => {
      const { token, user } = data.data;

      localStorage.setItem("token", token.access_token);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token.access_token}`;
      localStorage.setItem("user", JSON.stringify(user));

      loginUser(
        {
          userId: user._id,
          username: user.username,
          email: user.email,
          winHistory: user.winHistory,
        },
        token
      );

      toast.success("Login successful!");
    },
    onError: (error) => {
      toast.error(error.message || "Login failed!");
    },
  });
};
