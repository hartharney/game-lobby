"use client";

import { useEffect, useState } from "react";
import { useSessionSocket } from "@/hooks/useSessionSocket";
import { useRouter } from "next/navigation";
import { usePlayStore } from "@/store/usePlayStore";
import { useAuthStore } from "@/store/useAuthStore";
import { CountdownTimer } from "@/components/transitions/CountdownTimer";

export default function PlayPage() {
  const router = useRouter();
  const { session } = useSessionSocket();
  const { pickedNumber, sessionEndsAt, result, setPickedNumber, setResult } =
    usePlayStore();
  const { token } = useAuthStore();

  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.isActive || pickedNumber) return;

    const join = async () => {
      try {
        const data = await joinSession(token);
        setPickedNumber(data.pickedNumber, data.sessionEndsAt);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to join session");
      }
    };

    join();
  }, [session, pickedNumber, setPickedNumber, token]);

  useEffect(() => {
    if (!session?.isActive || !pickedNumber) return;

    if (new Date(session.endsAt).getTime() <= new Date().getTime()) {
      const winningNumber = session.winningNumber;
      if (winningNumber !== undefined) {
        setResult(pickedNumber === winningNumber ? "won" : "lost");
      }
    }
  }, [session, pickedNumber, setResult]);

  if (!token) {
    router.push("/");
    return null;
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 text-center">
      <h1 className="text-3xl font-bold">🎲 Play Session</h1>

      <CountdownTimer endTime={sessionEndsAt!} />

      {error && <p className="text-red-500">{error}</p>}

      {!session?.isActive ? (
        <p className="text-lg">No active session right now.</p>
      ) : !pickedNumber ? (
        <p className="text-lg">Joining session…</p>
      ) : (
        <>
          <p className="text-lg">
            You picked: <strong>{pickedNumber}</strong>
          </p>
          <p>
            Session ends at:{" "}
            <strong>{new Date(sessionEndsAt!).toLocaleTimeString()}</strong>
          </p>

          {result ? (
            <p
              className={`text-2xl font-bold ${
                result === "won" ? "text-green-500" : "text-red-500"
              }`}
            >
              You {result === "won" ? "won!" : "lost!"}
            </p>
          ) : (
            <p className="text-blue-500">Waiting for session result…</p>
          )}
        </>
      )}
    </div>
  );
}
function joinSession(token: string | null) {
  throw new Error("Function not implemented.");
}
