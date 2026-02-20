import random
import uuid
from typing import Dict
from datetime import datetime

from app.models.schemas import (
    Difficulty,
    GameState,
    CellState,
    NewGameRequest,
)

DIFFICULTY_CONFIG = {
    Difficulty.easy:   {"rows": 9,  "cols": 9,  "mines": 10},
    Difficulty.medium: {"rows": 16, "cols": 16, "mines": 40},
    Difficulty.hard:   {"rows": 16, "cols": 30, "mines": 99},
}

# In-memory game store (replace with Redis or DB for production)
_games: Dict[str, dict] = {}


def _create_board(rows: int, cols: int, mines: int) -> list:
    cells = [
        {"row": r, "col": c, "revealed": False, "flagged": False, "is_mine": False, "adjacent_mines": 0}
        for r in range(rows)
        for c in range(cols)
    ]
    mine_indices = random.sample(range(rows * cols), mines)
    for idx in mine_indices:
        cells[idx]["is_mine"] = True

    for cell in cells:
        if cell["is_mine"]:
            continue
        r, c = cell["row"], cell["col"]
        count = 0
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0:
                    continue
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    neighbor_idx = nr * cols + nc
                    if cells[neighbor_idx]["is_mine"]:
                        count += 1
        cell["adjacent_mines"] = count

    return cells


def create_game(req: NewGameRequest) -> GameState:
    cfg = DIFFICULTY_CONFIG[req.difficulty]
    rows, cols, mines = cfg["rows"], cfg["cols"], cfg["mines"]
    game_id = str(uuid.uuid4())
    cells = _create_board(rows, cols, mines)
    _games[game_id] = {
        "game_id": game_id,
        "difficulty": req.difficulty,
        "player_name": req.player_name,
        "rows": rows,
        "cols": cols,
        "mines": mines,
        "cells": cells,
        "status": "playing",
        "started_at": datetime.utcnow(),
    }
    return _build_state(game_id, safe=True)


def reveal_cell(game_id: str, row: int, col: int) -> GameState:
    game = _games.get(game_id)
    if not game or game["status"] != "playing":
        raise ValueError("Game not found or already finished")

    cells = game["cells"]
    cols = game["cols"]
    idx = row * cols + col
    cell = cells[idx]

    if cell["revealed"] or cell["flagged"]:
        return _build_state(game_id, safe=True)

    if cell["is_mine"]:
        cell["revealed"] = True
        game["status"] = "lost"
        return _build_state(game_id, safe=False)

    _flood_reveal(cells, row, col, game["rows"], cols)

    if _check_win(cells):
        game["status"] = "won"

    return _build_state(game_id, safe=game["status"] != "lost")


def toggle_flag(game_id: str, row: int, col: int) -> GameState:
    game = _games.get(game_id)
    if not game or game["status"] != "playing":
        raise ValueError("Game not found or already finished")

    cells = game["cells"]
    idx = row * game["cols"] + col
    cell = cells[idx]

    if not cell["revealed"]:
        cell["flagged"] = not cell["flagged"]

    return _build_state(game_id, safe=True)


def get_game(game_id: str) -> GameState:
    if game_id not in _games:
        raise ValueError("Game not found")
    game = _games[game_id]
    return _build_state(game_id, safe=game["status"] != "lost")


def _flood_reveal(cells: list, row: int, col: int, rows: int, cols: int):
    stack = [(row, col)]
    while stack:
        r, c = stack.pop()
        idx = r * cols + c
        cell = cells[idx]
        if cell["revealed"] or cell["flagged"] or cell["is_mine"]:
            continue
        cell["revealed"] = True
        if cell["adjacent_mines"] == 0:
            for dr in [-1, 0, 1]:
                for dc in [-1, 0, 1]:
                    if dr == 0 and dc == 0:
                        continue
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols:
                        stack.append((nr, nc))


def _check_win(cells: list) -> bool:
    return all(c["revealed"] or c["is_mine"] for c in cells)


def _build_state(game_id: str, safe: bool) -> GameState:
    game = _games[game_id]
    elapsed = (datetime.utcnow() - game["started_at"]).total_seconds()
    cell_states = []
    for c in game["cells"]:
        cell_states.append(CellState(
            row=c["row"],
            col=c["col"],
            revealed=c["revealed"],
            flagged=c["flagged"],
            is_mine=c["is_mine"] if (not safe or c["revealed"]) else False,
            adjacent_mines=c["adjacent_mines"],
        ))
    return GameState(
        game_id=game_id,
        difficulty=game["difficulty"],
        player_name=game["player_name"],
        rows=game["rows"],
        cols=game["cols"],
        mines=game["mines"],
        cells=cell_states,
        status=game["status"],
        elapsed_seconds=round(elapsed, 2),
    )
