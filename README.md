# AdiSweeper

Just got bored and created a Minesweeper clone.

Built with **FastAPI** (Python) on the backend and **Next.js** (TypeScript) on the frontend. Pick a difficulty, clear the board, and compete on the global leaderboard.

---

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+

---

### Backend

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Start the server
uvicorn app.main:app --reload
```

The API will be running at **http://localhost:8000**
Interactive API docs available at **http://localhost:8000/docs**

---

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Start the dev server
npm run dev
```

The app will be running at **http://localhost:3000**

---

## Project Structure

```
adisweeper/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── core/config.py    # Settings & environment variables
│   │   ├── db/session.py     # Async SQLAlchemy (SQLite)
│   │   ├── models/           # DB models & Pydantic schemas
│   │   ├── services/         # Game logic & score service
│   │   └── api/routes/       # REST endpoints
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── app/                  # Next.js App Router pages
    ├── components/
    │   ├── Game.tsx          # Full game board (setup, play, win/loss)
    │   └── Leaderboard.tsx   # Leaderboard with difficulty tabs
    └── lib/api.ts            # Typed API client
```

## Difficulties

| Difficulty | Grid | Mines |
|---|---|---|
| Easy | 9×9 | 10 |
| Medium | 16×16 | 40 |
| Hard | 16×30 | 99 |
