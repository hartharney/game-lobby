"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { CountdownTimer } from "@/components/transitions/CountdownTimer";

import { useJoinLobby } from "@/api/mutation";
import { useActiveSession, useGetUserHistory } from "@/api/query";
import { useSessionSocket } from "@/hooks/useSessionSocket";

import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { FaUser } from "react-icons/fa";
import { FaArrowRight, FaHome } from "react-icons/fa";

const fireConfetti = () => {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
};

export default function LobbyPage() {
  const router = useRouter();
  const { sessionStartedPayload, sessionEndedPayload, players } =
    useSessionSocket();
  const { mutate: joinLobby, isPending } = useJoinLobby();
  const { data: activeSessionData } = useActiveSession();
  const { data: userHistory } = useGetUserHistory();

  const [winners, setWinners] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [missedSession, setMissedSession] = useState(false);
  const [timeRemainingInSeconds, setTimeRemainingInSeconds] = useState<
    number | null
  >(null);
  const [step, setStep] = useState<
    | "number-select"
    | "waiting"
    | "game-play"
    | "missed"
    | "result-win"
    | "result-lose"
  >("number-select");

  const nextSessionTime =
    sessionStartedPayload?.nextSessionStartsAt ||
    sessionEndedPayload?.nextSessionStartsAt;

  const handleNumberSelect = async (num: number) => {
    setSelectedNumber(num);

    const now = new Date();
    const activeSession = activeSessionData?.activeSession;

    if (activeSession && new Date(activeSession.endsAt) > now) {
      toast.error("A session is currently active — please wait for it to end.");
      return;
    }

    // No active session — safe to join
    await joinLobby(num);
    setStep("waiting");
  };
  const formatTime = (isoString: string | null) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    if (step === "result-win") fireConfetti();
  }, [step]);

  useEffect(() => {
    if (
      players &&
      players.length === 0 &&
      !["number-select", "game-play", "result-win", "result-lose"].includes(
        step
      )
    ) {
      setStep("number-select");
      setSelectedNumber(null);
      setWinningNumber(null);
      setHasStartedGame(false);
    }
  }, [players, step]);

  useEffect(() => {
    if (!nextSessionTime) {
      setTimeRemainingInSeconds(null);
      return;
    }
    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(nextSessionTime).getTime() - Date.now()) / 1000)
      );
      setTimeRemainingInSeconds(remaining);
    };
    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [nextSessionTime]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUsername(JSON.parse(storedUser).username);
  }, []);

  useEffect(() => {
    if (!username) return;

    if (!players || players.length < 1) return;
    const existingPlayer = players.find((p) => p.username === username);

    if (existingPlayer && step === "number-select") {
      setSelectedNumber(existingPlayer.pickedNumber);
      setStep("waiting");
    }
  }, [username, players, step]);

  useEffect(() => {
    if (step === "waiting" && timeRemainingInSeconds === 0 && !hasStartedGame) {
      setHasStartedGame(true);
      setStep("game-play");

      setTimeout(() => {
        if (!sessionEndedPayload) return;
        const winner = sessionEndedPayload.winningNumber;
        setWinningNumber(winner);
        setWinners(sessionEndedPayload.winners || []);

        if (selectedNumber === null) {
          setMissedSession(true);
          setStep("missed");
        } else {
          if (selectedNumber === winner) setStep("result-win");
          else setStep("result-lose");
        }
      }, 5000);
    }
  }, [
    step,
    timeRemainingInSeconds,
    sessionEndedPayload,
    selectedNumber,
    hasStartedGame,
  ]);

  useEffect(() => {
    if (step === "result-win" || step === "result-lose") {
      const timer = setTimeout(() => {
        setSelectedNumber(null);
        setWinningNumber(null);
        setStep("number-select");
        setHasStartedGame(false);
        setMissedSession(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const numberBalls = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2c2d59] to-[#1a1a2e] text-white flex flex-col relative p-6">
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex justify-between gap-3 mb-4 relative z-50"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-300"
        >
          <FaHome />
          Home
        </button>
        <button
          onClick={() => router.push("/leaderboard")}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-300"
        >
          Visit Leaderboard
          <FaArrowRight />
        </button>
      </div>

      <div>
        <motion.div
          className="text-lg font-semibold whitespace-nowrap overflow-hidden bg-white/10 backdrop-blur-md text-white rounded-lg px-6 py-3 h-16 shadow-lg flex items-center justify-center w-full"
          style={{ background: "linear-gradient(90deg, #2c2d59, #1a1a2e)" }}
        >
          <motion.div
            className="flex items-center justify-start"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          >
            Registered Players 👥 {players?.length} | ⏳ Next game starts at{" "}
            {formatTime(nextSessionTime as string)} | User Stats:{" "}
            {userHistory
              ? `Wins: ${userHistory.winHistory?.length}, Losses: ${userHistory.winHistory?.length}`
              : "Loading..."}{" "}
            | Total Games played : {userHistory?.totalGamesPlayed}
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute inset-0">
        <div className="absolute w-72 h-72 bg-purple-600 opacity-30 rounded-full blur-3xl top-[-50px] left-[-50px]"></div>
        <div className="absolute w-72 h-72 bg-pink-500 opacity-20 rounded-full blur-3xl bottom-[-50px] right-[-50px]"></div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        {step === "number-select" && (
          <>
            {!sessionStartedPayload && !sessionEndedPayload ? (
              <>
                <h1 className="text-2xl font-bold mb-4">
                  Waiting for the admin to start a new session ⏳
                </h1>
                <p className="text-sm text-gray-300 mb-4">
                  Please hold on — a new session will begin shortly.
                </p>
                <p className="text-sm text-gray-300 mb-4">
                  Refresh if session does not start in 5 seconds.
                </p>
              </>
            ) : activeSessionData?.activeSession ? (
              <>
                <h1 className="text-2xl font-bold mb-4">
                  A session is currently active! ⏳
                </h1>
                <p className="text-sm text-gray-300 mb-4">
                  You can join the next session in:
                </p>
                {timeRemainingInSeconds !== null && (
                  <CountdownTimer duration={timeRemainingInSeconds} />
                )}
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-4">
                  Choose your lucky number! 🎲
                </h1>
                <p className="text-sm text-gray-300 mb-4">
                  {"Once selected, you'll be added to the lobby."}
                </p>
                {timeRemainingInSeconds !== null && (
                  <CountdownTimer duration={timeRemainingInSeconds} />
                )}
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
              </>
            )}
          </>
        )}

        {step === "waiting" && (
          <>
            <h1 className="text-2xl font-bold mb-4">
              {" Welcome to the Lobby, It's about to get real! 🎉"}
            </h1>
            <p className="text-sm text-gray-300 mb-4">
              {"You'll be auto-joined when the session starts."}
            </p>
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
          </>
        )}

        {step === "game-play" && (
          <>
            <h1 className="text-3xl font-bold mb-4">Game in progress! 🎲</h1>
            <p className="text-gray-300 mb-4">
              Waiting for the winning number...
            </p>
            <motion.div
              className="grid grid-cols-5 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {numberBalls.map((num) => (
                <motion.div
                  key={num}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: `hsl(${num * 36}, 70%, 50%)` }}
                  animate={{
                    y: ["0%", "-30%", "0%"],
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  {num}
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
        {missedSession && (
          <>
            <h1 className="text-2xl font-bold mb-4 text-red-400">
              You missed the last session 😔
            </h1>
            <p className="text-lg mt-2">
              Winning Number was:{" "}
              <span className="font-bold text-green-400">{winningNumber}</span>
            </p>
            <div className="mt-4">
              <h2 className="text-xl">🏆 Winners:</h2>
              <ul className="mt-2 space-y-1">
                {winners.map((winner, index) => (
                  <li key={index} className="text-white">
                    - {winner}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-300 mt-6">
              Next session starts in:
            </p>
            {timeRemainingInSeconds !== null && (
              <CountdownTimer duration={timeRemainingInSeconds} />
            )}
          </>
        )}

        {step === "result-win" && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
            <h1 className="text-4xl text-white font-bold">🎉 You won! 🎉</h1>
            <p className="text-lg mt-2">
              Winning Number:{" "}
              <span className="font-bold text-green-400">{winningNumber}</span>
            </p>
            <div className="mt-4">
              <h2 className="text-xl">🏆 Winners:</h2>
              <ul className="mt-2 space-y-1">
                {winners.map((winner, index) => (
                  <li key={index} className="text-white">
                    - {winner}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {step === "result-lose" && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <p className="text-5xl">😔</p>
              <h1 className="text-3xl text-white mt-4">
                Better luck next time!
              </h1>
              <p className="text-lg mt-2">
                Winning Number:{" "}
                <span className="font-bold text-red-400">{winningNumber}</span>
              </p>
              <div className="mt-4">
                <h2 className="text-xl text-white">🏆 Winners:</h2>
                <ul className="mt-2 space-y-1">
                  {winners.map((winner, index) => (
                    <li key={index} className="text-white">
                      - {winner}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        )}

        <div className="flex flex-col justify-center items-start mt-10 p-2">
          <h1 className=""> Players waiting in Lobby: </h1>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 z-10">
            {players && players.length > 0 ? (
              players.map((player, index) => (
                <div
                  key={index}
                  className="p-3 bg-white text-black rounded-lg flex items-center gap-2"
                >
                  <FaUser className="text-purple-600" />
                  <span>{player.username}</span>
                  <span className="ml-auto text-sm text-gray-500">
                    #{player.pickedNumber}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 bg-white text-black rounded-lg flex items-center gap-2">
                <span>No players in the lobby yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
