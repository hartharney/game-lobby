"use client";

import { useLeaderboard } from "@/api/query";
import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Player = {
  username: string;
  longestStreak: number;
  wins: number;
};

export default function LeaderboardPage() {
  const { data, isLoading, isError } = useLeaderboard();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "highestPoints", desc: true },
  ]);

  const router = useRouter();

  const handleBackToHome = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "username",
        header: () => <span>Username</span>,
        cell: (info: { getValue: () => string }) => info.getValue(),
      },
      {
        accessorKey: "longestStreak",
        header: () => <span>Longest Streak</span>,
        cell: (info: { getValue: () => number }) => info.getValue(),
      },
      {
        id: "highestPoints",
        header: () => <span>Highest Points</span>,
        cell: (info: { row: { original: Player } }) =>
          (info.row.original.wins * 10).toString(),
      },
    ],
    []
  );

  const table = useReactTable({
    data: data?.data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
    <main className="min-h-screen overflow-x-hidden overflow-y-hidden bg-gradient-to-br from-[#2c2d59] to-[#1a1a2e] text-white flex flex-col relative p-6">
      <div className="absolute inset-0">
        <div className="absolute w-72 h-72 bg-purple-600 opacity-30 rounded-full blur-3xl top-[-50px] left-[-50px]"></div>
        <div className="absolute w-72 h-72 bg-pink-500 opacity-20 rounded-full blur-3xl bottom-[-50px] right-[-50px]"></div>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
        <button
          onClick={handleBackToHome}
          className="text-blue-500 hover:underline"
          style={{ zIndex: 10 }} // Adjust the z-index if needed
        >
          Back to Home
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
        <table className="w-full border border-gray-200 rounded overflow-hidden">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-900 text-white">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 border text-left cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 border text-black">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
