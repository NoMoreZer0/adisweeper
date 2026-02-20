import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 bg-gray-950 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold tracking-tight mb-2">
          Adi<span className="text-yellow-400">Sweeper</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Free online Minesweeper — clear the board, beat the clock.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/play"
          className="px-8 py-4 bg-yellow-400 text-gray-950 font-bold rounded-xl hover:bg-yellow-300 transition-colors text-lg"
        >
          Play Now
        </Link>
        <Link
          href="/leaderboard"
          className="px-8 py-4 border border-gray-600 text-white font-bold rounded-xl hover:border-yellow-400 transition-colors text-lg"
        >
          Leaderboard
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-4 text-center">
        {[
          { label: "Easy", desc: "9×9 — 10 mines" },
          { label: "Medium", desc: "16×16 — 40 mines" },
          { label: "Hard", desc: "16×30 — 99 mines" },
        ].map((d) => (
          <div key={d.label} className="bg-gray-800 rounded-xl p-6">
            <div className="text-xl font-bold mb-1">{d.label}</div>
            <div className="text-gray-400 text-sm">{d.desc}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
