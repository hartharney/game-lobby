"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";
import { CountdownTimer } from "@/components/transitions/CountdownTimer";
import { useSocketStore } from "@/api/subscriber";
import { useJoinSession } from "@/api/mutation";
// import { useAuthStore } from "@/store/useAuthStore";

export default function LobbyPage() {
  // const user = useAuthStore((state) => state.user);
  const [username, setUsername] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const { connect, disconnect, sessionStartedPayload, sessionEndedPayload } =
    useSocketStore();
  const { mutate: joinSession, isPending, isError } = useJoinSession();

  const handleNumberSelect = (num: number) => {
    setSelectedNumber(num);
    joinSession(num); // this now correctly passes `num` to the mutation
  };

  console.log(
    "sessionStartedPayload",
    sessionStartedPayload,
    "sessionEndedPayload",
    sessionEndedPayload
  );

  function formatTime(isoString: string | null) {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const nextSessionTime =
    sessionStartedPayload?.nextSessionStartsAt ||
    sessionEndedPayload?.nextSessionStartsAt;

  const timeRemainingInSeconds = nextSessionTime
    ? Math.max(
        0,
        Math.floor((new Date(nextSessionTime).getTime() - Date.now()) / 1000)
      )
    : null;

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    // Check local storage first
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }
    const parsedUser = JSON.parse(storedUser as string);
    setUsername(parsedUser.username);
  }, []);

  const numberBalls = Array.from({ length: 10 }, (_, i) => i + 1);

  const dummyPlayers = [
    { username: "Alice", number: 3 },
    { username: "Bob", number: 7 },
    { username: "Charlie", number: 1 },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2c2d59] to-[#1a1a2e] text-white flex flex-col relative p-6">
      {/* rest of your lobby UI */}

      <motion.div
        className="text-lg font-semibold whitespace-nowrap overflow-hidden
             bg-white/10 backdrop-blur-md text-white
             rounded-lg px-6 py-3 h-16  shadow-lg flex items-center justify-center"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      >
        Registered Players 👥 {dummyPlayers.length} | ⏳ Next game starts at{" "}
        {formatTime(
          (sessionStartedPayload?.nextSessionStartsAt as string) ||
            (sessionEndedPayload?.nextSessionStartsAt as string)
        )}
      </motion.div>

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-72 h-72 bg-purple-600 opacity-30 rounded-full blur-3xl top-[-50px] left-[-50px]"></div>
        <div className="absolute w-72 h-72 bg-pink-500 opacity-20 rounded-full blur-3xl bottom-[-50px] right-[-50px]"></div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        {/* Number selection */}

        {username && selectedNumber === null && (
          <>
            <h1 className="text-2xl font-bold mb-4">
              Choose your lucky number! 🎲
            </h1>
            <p className="text-sm text-gray-300 mb-4">
              Once selected, you will automatically be added to the game lobby.
            </p>
          </>
        )}

        {username && selectedNumber !== null && (
          <>
            <h1 className="text-2xl font-bold mb-4">
              Its about to get real! 🎉
            </h1>
            <p className="text-sm text-gray-300 mb-4">
              Once the session starts you'll automatically be redirected to the
              game room
            </p>
          </>
        )}

        {username && selectedNumber === null && (
          <div className="flex gap-4 mt-6 flex-wrap z-10">
            {numberBalls.map((num) => (
              <motion.div
                key={num}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !isPending && handleNumberSelect(num)}
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg cursor-pointer"
                style={{ backgroundColor: `hsl(${num * 36}, 70%, 50%)` }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        )}

        {/* Player joined summary */}
        {username && selectedNumber !== null && (
          <div className="mt-10 text-center z-10 space-y-3">
            <p className="text-xl">
              ✅ {username} joined with number {selectedNumber}!
            </p>
            {timeRemainingInSeconds ? (
              <>
                <p className="text-sm">Session starts in</p>
                <CountdownTimer duration={timeRemainingInSeconds} />
              </>
            ) : (
              <p className="text-sm">Waiting for the next session...</p>
            )}
          </div>
        )}

        {/* Player list */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 z-10">
          {dummyPlayers.map((player, index) => (
            <div
              key={index}
              className="p-3 bg-white text-black rounded-lg flex items-center gap-2"
            >
              <FaUser className="text-purple-600" />
              <span>{player.username}</span>
              <span className="ml-auto text-sm text-gray-500">
                #{player.number}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        {/* <div className="mt-10 space-x-4 z-10">
          <button className="px-4 py-2 bg-green-500 rounded">
            Wait in Lobby
          </button>
        </div> */}
      </div>
    </main>
  );
}
