import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useActiveSession = () => {
  return useQuery({
    queryKey: ["activeSession"],
    queryFn: async () => {
      const res = await api.get("/game/active-session");
      return res.data;
    },
    refetchInterval: 1000,
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await api.get("/game/leaderboard");
      return res.data;
    },
  });
};

export const useGetUserHistory = () => {
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;

  return useQuery({
    queryKey: ["userHistory"],
    queryFn: async () => {
      if (!parsedUser?._id) {
        console.error("User ID is missing or invalid.");
        return null;
      }

      const res = await api.get(`/user/${parsedUser._id}`);

      return res.data.data;
    },
    enabled: !!parsedUser?._id,
  });
};
