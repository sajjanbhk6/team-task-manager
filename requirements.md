# Team Task Manager Requirements

This project is implemented with React, Vite, Tailwind CSS, FastAPI, SQLAlchemy, JWT authentication, and PostgreSQL on Railway.

## Backend

- [x] FastAPI server running
- [x] SQLAlchemy database connection configured
- [x] PostgreSQL connection configured through `DATABASE_URL`
- [x] SQLite fallback available for local testing
- [x] Auth APIs completed
- [x] Project APIs completed
- [x] Task APIs completed
- [x] Dashboard API completed
- [x] JWT authentication completed
- [x] Admin role dependency completed
- [x] Pydantic validations completed
- [x] Password hashing completed with bcrypt
- [x] CORS configured for frontend access

## Frontend

- [x] React app running with Vite
- [x] Routing completed
- [x] Login page completed
- [x] Signup page completed
- [x] Dashboard page completed
- [x] Projects page completed
- [x] Project details page completed
- [x] Tasks page completed
- [x] Protected routes completed
- [x] Role-based UI completed
- [x] Axios API client completed

## Database

- [x] `users` table model
- [x] `projects` table model
- [x] `project_members` table model
- [x] `tasks` table model
- [x] User-project-task relationships completed
- [x] Unique email constraint completed
- [x] Unique project member constraint completed
- [x] SQLAlchemy table creation configured on backend startup
- [x] Railway PostgreSQL supported

## Role-Based Access

- [x] Admin can create project
- [x] Admin can update project
- [x] Admin can delete project
- [x] Admin can add member
- [x] Admin can create task
- [x] Admin can assign task
- [x] Admin can update task
- [x] Admin can delete task
- [x] Member can view assigned project
- [x] Member can view assigned task
- [x] Member can update own task status
- [x] Member cannot access admin APIs
- [x] Non-member cannot access another project's details
- [x] Non-assignee cannot access another user's task

## Dashboard

- [x] Total tasks count
- [x] TODO tasks count
- [x] IN_PROGRESS tasks count
- [x] DONE tasks count
- [x] Overdue tasks count
- [x] Total projects count
- [x] Admin dashboard shows all data
- [x] Member dashboard shows assigned data only

## Deployment

- [x] Backend deployed on Railway
- [x] Frontend deployed on Railway
- [x] PostgreSQL deployed on Railway
- [x] Backend environment variables documented
- [x] Frontend environment variables documented
- [x] Backend health URL tested
- [x] Frontend live URL tested
- [x] Demo admin login tested
- [x] Demo member login tested

## Submission

- [x] Live frontend URL ready
- [x] Live backend URL ready
- [x] Final deployed app tested
- [x] Demo credentials documented
- [ ] GitHub repo URL added
- [ ] Demo video URL added

## Live URLs

- Frontend: `https://frontend-production-d08f.up.railway.app`
- Backend: `https://backend-production-f6a9.up.railway.app`
- Backend health: `https://backend-production-f6a9.up.railway.app/health`

## Demo Credentials

- Admin: `admin@demo.com` / `password123`
- Member: `member@demo.com` / `password123`
