"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, GameState, Difficulty, CellState } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string }[] = [
  { value: "easy",   label: "Easy",   desc: "9×9 · 10 mines"  },
  { value: "medium", label: "Medium", desc: "16×16 · 40 mines" },
  { value: "hard",   label: "Hard",   desc: "16×30 · 99 mines" },
];

const NUMBER_COLORS: Record<number, string> = {
  1: "text-blue-500",
  2: "text-green-500",
  3: "text-red-500",
  4: "text-blue-900",
  5: "text-red-900",
  6: "text-cyan-400",
  7: "text-purple-500",
  8: "text-gray-400",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Cell ─────────────────────────────────────────────────────────────────────

function Cell({
  cell,
  gameStatus,
  onReveal,
  onFlag,
}: {
  cell: CellState;
  gameStatus: string;
  onReveal: () => void;
  onFlag: (e: React.MouseEvent) => void;
}) {
  const isOver = gameStatus !== "playing";

  let bg = "";
  let content: React.ReactNode = null;

  if (cell.revealed) {
    if (cell.is_mine) {
      bg = "bg-red-600 border-red-700";
      content = "💣";
    } else {
      bg = "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600";
      if (cell.adjacent_mines > 0) {
        content = (
          <span className={`font-bold ${NUMBER_COLORS[cell.adjacent_mines] ?? "text-gray-800"}`}>
            {cell.adjacent_mines}
          </span>
        );
      }
    }
  } else if (cell.flagged) {
    bg = "bg-gray-600 border-gray-500 cursor-pointer";
    content = "🚩";
  } else if (cell.is_mine && gameStatus === "lost") {
    bg = "bg-gray-700 border-gray-500";
    content = "💣";
  } else {
    bg = isOver
      ? "bg-gray-600 border-gray-500"
      : "bg-gray-600 border-gray-500 hover:bg-gray-500 active:bg-gray-400 cursor-pointer";
  }

  return (
    <button
      className={`w-7 h-7 border text-xs flex items-center justify-center select-none transition-colors ${bg}`}
      onClick={isOver ? undefined : onReveal}
      onContextMenu={isOver ? undefined : onFlag}
    >
      {content}
    </button>
  );
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export default function Game() {
  const router = useRouter();

  const [phase, setPhase]           = useState<"setup" | "playing">("setup");
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [game, setGame]             = useState<GameState | null>(null);
  const [timer, setTimer]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  // Local timer — counts up while game is active
  useEffect(() => {
    if (!game || game.status !== "playing") return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [game?.status, game?.game_id]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const startGame = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const state = await api.newGame(playerName.trim(), difficulty);
      setGame(state);
      setTimer(0);
      setPhase("playing");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = useCallback(
    async (row: number, col: number) => {
      if (!game || game.status !== "playing") return;
      try {
        const state = await api.revealCell(game.game_id, row, col);
        setGame(state);
        if (state.status !== "playing") {
          api
            .submitScore({
              player_name: game.player_name,
              difficulty: game.difficulty,
              time_seconds: timer,
              won: state.status === "won",
            })
            .catch(() => {});
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error");
      }
    },
    [game, timer]
  );

  const handleFlag = useCallback(
    async (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (!game || game.status !== "playing") return;
      try {
        const state = await api.toggleFlag(game.game_id, row, col);
        setGame(state);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error");
      }
    },
    [game]
  );

  const restart = () => {
    setGame(null);
    setPhase("setup");
    setTimer(0);
    setError(null);
    setConfirmLeave(false);
  };

  // "Go Back" pressed while game is still active → show warning first
  const handleGoBack = () => {
    if (game && game.status === "playing") {
      setConfirmLeave(true);
    } else {
      router.push("/");
    }
  };

  // ── Setup screen ─────────────────────────────────────────────────────────

  if (phase === "setup") {
    return (
      <div className="flex flex-col items-center gap-8">
        {/* Back to home */}
        <div className="self-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">New Game</h2>
          <p className="text-gray-400 text-sm">Enter your name and pick a difficulty</p>
        </div>

        <input
          type="text"
          placeholder="Your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startGame()}
          maxLength={50}
          className="w-64 px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
        />

        <div className="flex gap-3">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`px-5 py-3 rounded-xl border font-semibold transition-colors ${
                difficulty === d.value
                  ? "bg-yellow-400 text-gray-950 border-yellow-400"
                  : "border-gray-600 text-gray-300 hover:border-yellow-400"
              }`}
            >
              <div>{d.label}</div>
              <div className="text-xs font-normal mt-0.5 opacity-70">{d.desc}</div>
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={startGame}
          disabled={!playerName.trim() || loading}
          className="px-10 py-4 bg-yellow-400 text-gray-950 font-bold rounded-xl hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg"
        >
          {loading ? "Starting…" : "Start Game"}
        </button>
      </div>
    );
  }

  // ── Game screen ──────────────────────────────────────────────────────────

  if (!game) return null;

  const flagsPlaced    = game.cells.filter((c) => c.flagged).length;
  const remainingMines = game.mines - flagsPlaced;
  const isGameOver     = game.status !== "playing";
  const statusEmoji    = game.status === "won" ? "🎉" : game.status === "lost" ? "💥" : "🙂";

  const rows: CellState[][] = Array.from({ length: game.rows }, (_, r) =>
    game.cells.slice(r * game.cols, (r + 1) * game.cols)
  );

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Top bar: back button */}
      <div className="self-start">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm"
        >
          ← Back to Home
        </button>
      </div>

      {/* Leave warning — shown only when game is active and user clicked Go Back */}
      {confirmLeave && (
        <div className="flex items-center gap-4 bg-yellow-500/10 border border-yellow-500 text-yellow-300 px-5 py-3 rounded-xl text-sm">
          <span>⚠️ Your current game progress will be lost. Are you sure you want to leave?</span>
          <button
            onClick={() => router.push("/")}
            className="px-3 py-1 bg-yellow-500 text-gray-950 font-bold rounded-lg hover:bg-yellow-400 transition-colors whitespace-nowrap"
          >
            Yes, leave
          </button>
          <button
            onClick={() => setConfirmLeave(false)}
            className="px-3 py-1 border border-gray-500 text-gray-300 rounded-lg hover:border-gray-400 transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      )}

      {/* HUD */}
      <div className="flex items-center gap-8 bg-gray-800 px-6 py-3 rounded-xl">
        <div className="text-center min-w-16">
          <div className="text-xl font-bold text-red-400">💣 {remainingMines}</div>
          <div className="text-xs text-gray-500">mines left</div>
        </div>

        <button
          onClick={restart}
          className="text-2xl hover:scale-110 transition-transform"
          title="New game"
        >
          {statusEmoji}
        </button>

        <div className="text-center min-w-16">
          <div className="text-xl font-bold text-yellow-400">⏱ {formatTime(timer)}</div>
          <div className="text-xs text-gray-500">time</div>
        </div>
      </div>

      {/* Win / loss banner */}
      {isGameOver && (
        <div
          className={`flex items-center gap-4 px-6 py-3 rounded-xl font-bold text-lg ${
            game.status === "won" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          <span>
            {game.status === "won" ? `You won in ${formatTime(timer)}! 🎉` : "Game over! 💥"}
          </span>
          <button onClick={restart} className="underline text-sm font-normal">
            Play again
          </button>
          <Link href="/" className="underline text-sm font-normal">
            Go Home
          </Link>
        </div>
      )}

      {/* Board */}
      <div
        className="border-2 border-gray-600 rounded overflow-auto"
        onContextMenu={(e) => e.preventDefault()}
      >
        {rows.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell) => (
              <Cell
                key={`${cell.row}-${cell.col}`}
                cell={cell}
                gameStatus={game.status}
                onReveal={() => handleReveal(cell.row, cell.col)}
                onFlag={(e) => handleFlag(e, cell.row, cell.col)}
              />
            ))}
          </div>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <p className="text-gray-500 text-xs">Left click to reveal · Right click to flag</p>
    </div>
  );
}
