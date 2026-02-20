import type { Metadata } from "next";
import Leaderboard from "@/components/Leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top Minesweeper times on AdiSweeper. Can you beat the best players?",
};

export default function LeaderboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-950 text-white">
      <Leaderboard />
    </main>
  );
}
