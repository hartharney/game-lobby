"use client";

import { useLeaderboard } from "@/api/query";
import Link from "next/link";

export default function LeaderboardPage() {
  const { data, isLoading, isError } = useLeaderboard();

  if (isLoading) {
    return <div className="p-6 text-center">Loading leaderboard...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load leaderboard.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
        <Link href="/lobby" className="text-blue-500 hover:underline">
          Back to Lobby
        </Link>
      </div>

      <table className="w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Wins</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player: any, index: number) => (
            <tr key={player._id} className="text-center hover:bg-gray-50">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{player.username}</td>
              <td className="p-2 border">{player.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
