# Team Task Manager

A full-stack task manager for creating projects, adding team members, assigning tasks, and tracking progress with Admin and Member access.

## Features

- Signup, login, JWT authentication
- Admin and Member roles
- Project CRUD for admins
- Project member assignment
- Task creation, assignment, status, priority, and due date tracking
- Member task status updates
- Dashboard counts for total, status-wise, overdue tasks, and projects

## Tech Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL, JWT, passlib bcrypt
- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Deployment: Railway

## Local Setup

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- Health check: `http://localhost:8000/health`

## Environment

Backend `backend/.env`:

```env
DATABASE_URL="sqlite:///./team_task_manager.db"
JWT_SECRET="replace_with_a_long_random_secret"
CORS_ORIGINS="http://localhost:5173"
PORT=8000
```

Frontend `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

## Role Rules

Admin users can manage projects, add members, create and assign tasks, update any task, delete projects/tasks, and view all dashboard data.

Member users can view assigned projects/tasks, update only their assigned task status, and view their own dashboard data.

## API Endpoints

Health:

- `GET /health`

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Projects:

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/{project_id}`
- `PUT /api/projects/{project_id}`
- `DELETE /api/projects/{project_id}`
- `POST /api/projects/{project_id}/members`

Tasks:

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/{task_id}`
- `PUT /api/tasks/{task_id}`
- `DELETE /api/tasks/{task_id}`

Dashboard:

- `GET /api/dashboard`

Protected API routes require:

```http
Authorization: Bearer <jwt_token>
```

## Railway Deployment

Create three Railway services:

1. PostgreSQL database
2. Backend service from `/backend`
3. Frontend service from `/frontend`

Backend variables:

```env
DATABASE_URL=<Railway PostgreSQL connection URL>
JWT_SECRET=<long random secret>
CORS_ORIGINS=<deployed frontend URL>
```

Frontend variables:

```env
VITE_API_URL=<deployed backend URL>/api
```

Backend start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Frontend build command:

```bash
npm run build
```

Frontend start command:

```bash
npm run start
```

## Submission

- Live URL: https://frontend-production-d08f.up.railway.app
- Backend URL: https://backend-production-f6a9.up.railway.app
- GitHub Repo:
- Demo Video:
- Demo Admin Credentials: `admin@demo.com` / `password123`
- Demo Member Credentials: `member@demo.com` / `password123`
