import type { Metadata } from "next";
import Game from "@/components/Game";

export const metadata: Metadata = {
  title: "Play Minesweeper",
  description: "Start a new game of AdiSweeper. Pick your difficulty and clear the minefield!",
};

export default function PlayPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-950 text-white">
      <Game />
    </main>
  );
}
