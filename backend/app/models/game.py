from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func
from app.db.session import Base


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String(50), nullable=False)
    difficulty = Column(String(10), nullable=False)  # easy | medium | hard
    time_seconds = Column(Float, nullable=False)
    won = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
