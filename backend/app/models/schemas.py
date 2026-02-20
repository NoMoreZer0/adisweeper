from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


# --- Game schemas ---

class CellRevealRequest(BaseModel):
    row: int
    col: int


class FlagRequest(BaseModel):
    row: int
    col: int


class NewGameRequest(BaseModel):
    difficulty: Difficulty = Difficulty.easy
    player_name: str = Field(..., min_length=1, max_length=50)


class CellState(BaseModel):
    row: int
    col: int
    revealed: bool
    flagged: bool
    is_mine: bool
    adjacent_mines: int


class GameState(BaseModel):
    game_id: str
    difficulty: Difficulty
    player_name: str
    rows: int
    cols: int
    mines: int
    cells: List[CellState]
    status: str  # playing | won | lost
    elapsed_seconds: float


# --- Score schemas ---

class ScoreCreate(BaseModel):
    player_name: str
    difficulty: Difficulty
    time_seconds: float
    won: bool


class ScoreOut(BaseModel):
    id: int
    player_name: str
    difficulty: Difficulty
    time_seconds: float
    won: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    rank: int
    player_name: str
    difficulty: Difficulty
    time_seconds: float
    created_at: datetime
