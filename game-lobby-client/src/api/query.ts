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
