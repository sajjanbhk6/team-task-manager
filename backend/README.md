# Python FastAPI Backend

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

## Environment

```env
DATABASE_URL="postgresql://username:password@localhost:5432/team_task_manager"
JWT_SECRET="replace_with_a_long_random_secret"
CORS_ORIGINS="http://localhost:5173"
PORT=8000
```

If `DATABASE_URL` is not changed, the app can use the configured local database URL. For quick local testing, set it to:

```env
DATABASE_URL="sqlite:///./team_task_manager.db"
```

## Railway

Use:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```
