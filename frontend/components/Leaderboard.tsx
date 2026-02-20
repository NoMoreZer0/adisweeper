"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api, LeaderboardEntry, Difficulty } from "@/lib/api";

const TABS: { value: Difficulty; label: string; desc: string }[] = [
  { value: "easy",   label: "Easy",   desc: "9×9 · 10 mines"  },
  { value: "medium", label: "Medium", desc: "16×16 · 40 mines" },
  { value: "hard",   label: "Hard",   desc: "16×30 · 99 mines" },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function Leaderboard() {
  const [tab, setTab]         = useState<Difficulty>("easy");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (difficulty: Difficulty) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLeaderboard(difficulty);
      setEntries(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(tab);
  }, [tab, fetchLeaderboard]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm"
        >
          ← Back to Home
        </Link>
        <button
          onClick={() => fetchLeaderboard(tab)}
          className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
          title="Refresh"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-extrabold mb-1">Leaderboard</h1>
        <p className="text-gray-400 text-sm">Top 10 fastest wins per difficulty</p>
      </div>

      {/* Difficulty tabs */}
      <div className="flex gap-2 bg-gray-800 p-1 rounded-xl">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.value
                ? "bg-yellow-400 text-gray-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
            <span className="block text-xs font-normal opacity-70">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            Loading…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400">
            <span>{error}</span>
            <button
              onClick={() => fetchLeaderboard(tab)}
              className="text-sm underline text-gray-400 hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-500">
            <span className="text-4xl">🏜️</span>
            <span>No scores yet for {tab} difficulty.</span>
            <Link href="/play" className="text-yellow-400 hover:underline text-sm">
              Be the first to play →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-left">
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">Time</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-700 transition-colors ${
                    i === 0
                      ? "bg-yellow-400/10"
                      : i % 2 === 0
                      ? "bg-gray-900"
                      : "bg-gray-950"
                  }`}
                >
                  <td className="px-4 py-3 font-bold text-gray-400">
                    {MEDAL[entry.rank] ?? entry.rank}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {entry.player_name}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-yellow-400">
                    {formatTime(entry.time_seconds)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {formatDate(entry.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-center">
        <Link
          href="/play"
          className="inline-block px-8 py-3 bg-yellow-400 text-gray-950 font-bold rounded-xl hover:bg-yellow-300 transition-colors"
        >
          Play Now
        </Link>
      </div>
    </div>
  );
}
