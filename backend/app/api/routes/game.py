from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    NewGameRequest,
    CellRevealRequest,
    FlagRequest,
    GameState,
)
from app.services import game_service

router = APIRouter(prefix="/game", tags=["game"])


@router.post("/new", response_model=GameState)
async def new_game(req: NewGameRequest):
    return game_service.create_game(req)


@router.get("/{game_id}", response_model=GameState)
async def get_game(game_id: str):
    try:
        return game_service.get_game(game_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{game_id}/reveal", response_model=GameState)
async def reveal_cell(game_id: str, req: CellRevealRequest):
    try:
        return game_service.reveal_cell(game_id, req.row, req.col)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{game_id}/flag", response_model=GameState)
async def toggle_flag(game_id: str, req: FlagRequest):
    try:
        return game_service.toggle_flag(game_id, req.row, req.col)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
