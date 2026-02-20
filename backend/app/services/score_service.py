from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.game import Score
from app.models.schemas import ScoreCreate, ScoreOut, LeaderboardEntry, Difficulty
from typing import List


async def save_score(db: AsyncSession, data: ScoreCreate) -> ScoreOut:
    score = Score(
        player_name=data.player_name,
        difficulty=data.difficulty.value,
        time_seconds=data.time_seconds,
        won=data.won,
    )
    db.add(score)
    await db.commit()
    await db.refresh(score)
    return ScoreOut.model_validate(score)


async def get_leaderboard(
    db: AsyncSession,
    difficulty: Difficulty,
    limit: int = 10,
) -> List[LeaderboardEntry]:
    result = await db.execute(
        select(Score)
        .where(Score.difficulty == difficulty.value, Score.won == True)
        .order_by(Score.time_seconds.asc())
        .limit(limit)
    )
    scores = result.scalars().all()
    return [
        LeaderboardEntry(
            rank=i + 1,
            player_name=s.player_name,
            difficulty=s.difficulty,
            time_seconds=s.time_seconds,
            created_at=s.created_at,
        )
        for i, s in enumerate(scores)
    ]
