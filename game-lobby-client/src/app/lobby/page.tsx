"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { CountdownTimer } from "@/components/transitions/CountdownTimer";

import { useJoinLobby } from "@/api/mutation";
import { useActiveSession, useGetUserHistory } from "@/api/query";
import { useSessionSocket } from "@/hooks/useSessionSocket";

import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaUser } from "react-icons/fa";
import { FaArrowRight, FaHome, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import ResultModal from "@/components/modal/ResultModal";

const streamUrls = [
  "https://stream.zeno.fm/3f6bg86spm0uv",
  "http://ice1.somafm.com/groovesalad-128-mp3",
  "http://streaming.tdiradio.com:8000/house.mp3",
  "http://stream.live.vc.bbcmedia.co.uk/bbc_radio3",
  "https://stream.zeno.fm/f8r5x1t5v0hvv",
];
function getRandomStream() {
  return streamUrls[Math.floor(Math.random() * streamUrls.length)];
}

const getRemainingSeconds = (timeString: string | null) =>
  timeString
    ? Math.max(
        0,
        Math.floor((new Date(timeString).getTime() - Date.now()) / 1000)
      )
    : 0;

export default function LobbyPage() {
  const router = useRouter();
  const { sessionStartedPayload, sessionEndedPayload, players } =
    useSessionSocket();
  const { mutate: joinLobby, isPending } = useJoinLobby();
  const { data: activeSessionData } = useActiveSession();
  const { data: userHistory } = useGetUserHistory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [winners, setWinners] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [timeRemainingInSeconds, setTimeRemainingInSeconds] = useState<
    number | null
  >(null);
  const [step, setStep] = useState<"number-select" | "waiting">(
    "number-select"
  );
  const [result, setResult] = useState<"result-win" | "result-lose" | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(true);

  const [currentStream, setCurrentStream] = useState(getRandomStream());
  const audioRef = useRef<HTMLAudioElement>(null);

  const nextSessionTime = sessionEndedPayload?.nextSessionStartsAt ?? null;
  const sessionStartedTime = sessionStartedPayload?.startedAt ?? null;
  const sessionEndsAt = sessionStartedPayload?.endsAt ?? null;

  const handleNumberSelect = async (num: number) => {
    setSelectedNumber(num);
    joinLobby(num);
    setStep("waiting");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStep("number-select");
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = () => {
      const newStream = getRandomStream();
      setCurrentStream(newStream);
      console.warn(`Stream failed, switching to: ${newStream}`);
    };

    audio.addEventListener("error", handleError);
    return () => {
      audio.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    if (!nextSessionTime) return;

    setStep("number-select");
    const remainingSeconds = getRemainingSeconds(nextSessionTime);
    const startsIn = getRemainingSeconds(sessionStartedTime);

    if (remainingSeconds > 0) {
      toast(`Next session starts in ${remainingSeconds} seconds!`, {
        duration: 5000,
        icon: "⏳",
        style: {
          background: "#1a1a2e",
          color: "#fff",
        },
      });
    }

    const interval = setInterval(() => {
      if (remainingSeconds === 0 && sessionStartedTime) {
        // Only transition to "waiting" if session has actually started
        setStep("waiting");
        if (startsIn > 0) {
          toast(`Session started! Ends in ${startsIn} seconds`, {
            duration: 5000,
            icon: "🎉",
            style: {
              background: "#1a1a2e",
              color: "#fff",
            },
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextSessionTime, sessionStartedTime]);

  useEffect(() => {
    if (!sessionEndsAt) return;
    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(sessionEndsAt).getTime() - Date.now()) / 1000)
      );
      setTimeRemainingInSeconds(remaining);
    };
    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [sessionEndsAt]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUsername(JSON.parse(storedUser).username);
  }, []);

  useEffect(() => {
    if (!username || !players || players.length < 1) return;
    const existingPlayer = players.find((p) => p.username === username);
    if (existingPlayer && step === "number-select") {
      setSelectedNumber(existingPlayer.pickedNumber);
      setStep("waiting");
    }
  }, [username, players, step]);

  useEffect(() => {
    if (!sessionEndedPayload) return;
    const winner = sessionEndedPayload.winningNumber;
    setWinningNumber(winner);
    setWinners(sessionEndedPayload.winners || []);

    if (selectedNumber === winner) setResult("result-win");
    else setResult("result-lose");

    setIsModalOpen(true);
    setSelectedNumber(null);
  }, [sessionEndedPayload]);

  const numberBalls = Array.from({ length: 10 }, (_, i) => i + 1);

  // Disable number selection if the session has already started or if time is up
  const isDisabled =
    getRemainingSeconds(nextSessionTime as string) < 1 ||
    nextSessionTime === null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2c2d59] to-[#1a1a2e] text-white flex flex-col relative p-6">
      <audio
        ref={audioRef}
        src={currentStream}
        autoPlay
        loop
        style={{ display: "none" }}
      />

      {isModalOpen && step && (
        <ResultModal
          step={result}
          winningNumber={winningNumber as number}
          winners={winners}
          onClose={handleCloseModal}
        />
      )}
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

      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const audio = audioRef.current;
            if (!audio) return;

            if (audio.paused) {
              audio.play();
              setIsPlaying(true);
            } else {
              audio.pause();
              setIsPlaying(false);
            }
          }}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-700 transition flex items-center gap-2"
        >
          {/* Sound Icon */}
          {isPlaying ? (
            <FaVolumeUp className="text-xl" />
          ) : (
            <FaVolumeMute className="text-xl" />
          )}

          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-3 h-3 bg-white rounded-full"
            style={{
              marginLeft: "8px",
              display: isPlaying ? "inline-block" : "none",
            }}
          />
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
                  No current running sessions ⏳
                </h1>
                <p className="text-sm text-gray-300 mb-4">
                  Please hold on — a new session will begin shortly.
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
                {nextSessionTime !== null && (
                  <CountdownTimer
                    duration={getRemainingSeconds(nextSessionTime as string)}
                  />
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
                <p className="text-sm text-gray-300 mb-4">
                  {"Select a number between 1 and 10. Game starts soon"}
                </p>
                {nextSessionTime !== null && (
                  <CountdownTimer
                    duration={getRemainingSeconds(nextSessionTime as string)}
                  />
                )}
                {/* {timeRemainingInSeconds !== null && (
                  <CountdownTimer duration={timeRemainingInSeconds} />
                )} */}
                <div className="flex gap-4 mt-6 flex-wrap z-10">
                  {numberBalls.map((num) => (
                    <motion.div
                      key={num}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        !isPending && !isDisabled && handleNumberSelect(num)
                      }
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg cursor-pointer ${
                        isDisabled ? "cursor-not-allowed opacity-50" : ""
                      }`}
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

            <h1 className="text-3xl font-bold mb-4">Game in progress! 🎲</h1>
            <p className="text-gray-300 mb-4">
              Waiting for the winning number...
            </p>

            <div className="mt-4 mb-4 text-center z-10 space-y-3">
              {timeRemainingInSeconds && (
                <>
                  <p className="text-sm">Session ends in</p>
                  <CountdownTimer duration={timeRemainingInSeconds} />
                </>
              )}
            </div>

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

            <div>
              {selectedNumber !== null ? (
                <>
                  <p className="text-xl">
                    ✅ {username} joined with number {selectedNumber}!
                  </p>
                </>
              ) : (
                "You missed joining this session — please wait for the next one."
              )}
            </div>
          </>
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
