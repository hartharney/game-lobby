import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

export const useStartSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/game/start-session");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeSession"] });
    },
  });
};

export const useJoinSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (selectedNumber: number) => {
      const token = localStorage.getItem("token");
      console.log("token:", token);
      const res = await api.post(
        "/game/join",
        { number: selectedNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeSession"] });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: {
      username: string;
      email: string;
      password: string;
    }) => {
      const res = await api.post("/auth/register", data);
      return res.data;
    },
  });
};

export const useLogin = () => {
  const loginUser = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await api.post("/auth/login", data);
      return res.data;
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
    },
  });
};
