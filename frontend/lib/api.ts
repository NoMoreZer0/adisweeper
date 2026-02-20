const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// --- Game ---

export type Difficulty = "easy" | "medium" | "hard";

export interface CellState {
  row: number;
  col: number;
  revealed: boolean;
  flagged: boolean;
  is_mine: boolean;
  adjacent_mines: number;
}

export interface GameState {
  game_id: string;
  difficulty: Difficulty;
  player_name: string;
  rows: number;
  cols: number;
  mines: number;
  cells: CellState[];
  status: "playing" | "won" | "lost";
  elapsed_seconds: number;
}

export const api = {
  newGame: (player_name: string, difficulty: Difficulty) =>
    request<GameState>("/game/new", {
      method: "POST",
      body: JSON.stringify({ player_name, difficulty }),
    }),

  getGame: (game_id: string) =>
    request<GameState>(`/game/${game_id}`),

  revealCell: (game_id: string, row: number, col: number) =>
    request<GameState>(`/game/${game_id}/reveal`, {
      method: "POST",
      body: JSON.stringify({ row, col }),
    }),

  toggleFlag: (game_id: string, row: number, col: number) =>
    request<GameState>(`/game/${game_id}/flag`, {
      method: "POST",
      body: JSON.stringify({ row, col }),
    }),

  // --- Leaderboard ---

  submitScore: (data: {
    player_name: string;
    difficulty: Difficulty;
    time_seconds: number;
    won: boolean;
  }) =>
    request("/leaderboard/scores", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getLeaderboard: (difficulty: Difficulty, limit = 10) =>
    request<LeaderboardEntry[]>(`/leaderboard/${difficulty}?limit=${limit}`),
};

export interface LeaderboardEntry {
  rank: number;
  player_name: string;
  difficulty: Difficulty;
  time_seconds: number;
  created_at: string;
}
