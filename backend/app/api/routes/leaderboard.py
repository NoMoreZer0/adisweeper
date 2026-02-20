from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.models.schemas import ScoreCreate, ScoreOut, LeaderboardEntry, Difficulty
from app.services import score_service

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.post("/scores", response_model=ScoreOut)
async def submit_score(data: ScoreCreate, db: AsyncSession = Depends(get_db)):
    return await score_service.save_score(db, data)


@router.get("/{difficulty}", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    difficulty: Difficulty,
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    return await score_service.get_leaderboard(db, difficulty, limit)
