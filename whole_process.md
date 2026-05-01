# Team Task Manager - Complete End-to-End Process

This document explains the complete flow of the Team Task Manager project from frontend to backend to database. It covers which files are used, how requests move through the app, what JSON payloads are sent, what responses come back, and how the real user flow works.

## How This Document Is Structured

Read this document in this order if you want to understand the project exactly as it is implemented:

```txt
1. Understand what the app does.
2. Understand the tech stack.
3. Understand the folder structure.
4. Understand backend files.
5. Understand frontend files.
6. Understand database tables and relationships.
7. Understand authentication and RBAC.
8. Understand API base URLs, schemas, and responses.
9. Understand the real user flow from Admin to Member.
10. Understand curl/API testing.
11. Understand Railway deployment and Railway Postgres.
12. Understand request lifecycle in detail.
13. Understand database storage in detail.
14. Understand frontend state/localStorage.
15. Understand troubleshooting and acceptance checks.
16. Understand JWT secret, Railway, VITE_API_URL, and interview/demo talking points.
```

The document intentionally starts with high-level concepts and then goes deeper into implementation, deployment, testing, and explanation notes.

## Main Implementation Flow

The project works in this order:

```txt
React UI
-> Axios API client
-> FastAPI route
-> Pydantic schema validation
-> JWT authentication / role check
-> SQLAlchemy database query
-> Railway PostgreSQL
-> Serializer response
-> React state update
-> UI refresh
```

Keep this sequence in mind while reading every section.

## 1. Project Overview

The application is a full-stack Team Task Manager.

Users can:

- Sign up and log in.
- Use one of two roles: `ADMIN` or `MEMBER`.
- Admins can create projects, add members, create tasks, assign tasks, update tasks, and delete projects/tasks.
- Members can view assigned projects/tasks and update only their own task status.
- Dashboard shows task/project counts based on role.

Live deployment:

- Frontend: `https://frontend-production-d08f.up.railway.app`
- Backend: `https://backend-production-f6a9.up.railway.app`
- Backend API base URL: `https://backend-production-f6a9.up.railway.app/api`
- Health check: `https://backend-production-f6a9.up.railway.app/health`

Local development:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Backend API base URL: `http://localhost:8000/api`

## 2. Tech Stack

Frontend:

- React
- Vite
- React Router
- Axios
- Tailwind CSS

Backend:

- FastAPI
- SQLAlchemy
- PostgreSQL on Railway
- SQLite fallback for local testing
- JWT authentication with PyJWT
- Password hashing with passlib bcrypt
- Pydantic validation schemas

Deployment:

- Railway frontend service
- Railway backend service
- Railway PostgreSQL service

## 3. Main Folder Structure

```txt
team-task-manager/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── runtime.txt
│   ├── .env.example
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── security.py
│       ├── dependencies.py
│       ├── serializers.py
│       ├── utils.py
│       └── routers/
│           ├── auth.py
│           ├── projects.py
│           ├── tasks.py
│           └── dashboard.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── axios.js
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── ProjectForm.jsx
│       │   ├── TaskForm.jsx
│       │   └── StatCard.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Projects.jsx
│       │   ├── ProjectDetails.jsx
│       │   └── Tasks.jsx
│       └── styles/
│           └── index.css
│
├── README.md
└── whole_process.md
```

## 4. Backend File Responsibilities

### `backend/main.py`

This is the deployment entrypoint.

Railway starts the backend with:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

This file imports the FastAPI app from `backend/app/main.py`.

### `backend/app/main.py`

This creates the FastAPI application.

Responsibilities:

- Create `FastAPI(title="Team Task Manager API")`.
- Add CORS middleware.
- Create database tables on startup using SQLAlchemy metadata.
- Add `/health` route.
- Include all routers:
  - auth
  - projects
  - tasks
  - dashboard

Important routes loaded here:

```py
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
```

### `backend/app/config.py`

Reads environment variables.

Variables:

```env
DATABASE_URL
JWT_SECRET
CORS_ORIGINS
PORT
```

If `DATABASE_URL` is not provided, local SQLite is used:

```txt
sqlite:///./team_task_manager.db
```

### `backend/app/database.py`

Creates the SQLAlchemy engine and database session.

Important behavior:

- Converts Railway/Postgres URLs from `postgres://` or `postgresql://` to `postgresql+psycopg2://`.
- Uses SQLite `check_same_thread=False` only for SQLite.
- Provides `get_db()` dependency for API routes.

Every route that needs the database receives:

```py
db: Session = Depends(get_db)
```

### `backend/app/models.py`

Defines database tables and relationships.

Tables:

- `users`
- `projects`
- `project_members`
- `tasks`

Enums:

```txt
Role: ADMIN, MEMBER
TaskStatus: TODO, IN_PROGRESS, DONE
Priority: LOW, MEDIUM, HIGH
```

### `backend/app/schemas.py`

Defines request validation models using Pydantic.

These classes define which JSON payloads are accepted by the API.

### `backend/app/security.py`

Handles:

- Password hashing.
- Password verification.
- JWT token creation.
- JWT token decoding.

Passwords are never stored directly. The signup flow stores a hashed password.

### `backend/app/dependencies.py`

Handles authentication and role checks.

Important functions:

```py
get_current_user()
require_admin()
```

`get_current_user()`:

- Reads `Authorization: Bearer <token>`.
- Decodes JWT.
- Finds user in database.
- Rejects invalid/expired token.

`require_admin()`:

- Calls `get_current_user()`.
- Allows request only if user role is `ADMIN`.

### `backend/app/serializers.py`

Converts SQLAlchemy model objects into JSON-safe dictionaries.

Used for:

- User response
- Project response
- Project member response
- Task response

This is why API responses use frontend-friendly names like:

```json
{
  "createdAt": "...",
  "dueDate": "...",
  "projectId": "..."
}
```

instead of database names like:

```txt
created_at
due_date
project_id
```

### `backend/app/utils.py`

Generates IDs for new records.

Used when creating:

- Users
- Projects
- Project members
- Tasks

## 5. Frontend File Responsibilities

### `frontend/src/main.jsx`

React entrypoint.

It mounts the app into the HTML root.

### `frontend/src/App.jsx`

Defines frontend routes.

Routes:

```txt
/             -> Dashboard
/projects     -> Projects
/projects/:id -> ProjectDetails
/tasks        -> Tasks
/login        -> Login
/signup       -> Signup
```

Protected routes:

- `/`
- `/projects`
- `/projects/:id`
- `/tasks`

Public routes:

- `/login`
- `/signup`

### `frontend/src/api/axios.js`

Creates the Axios client used by the whole frontend.

Important behavior:

```js
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
```

In deployment:

```env
VITE_API_URL=https://backend-production-f6a9.up.railway.app/api
```

It also attaches the JWT token to every request:

```http
Authorization: Bearer <token>
```

The token is read from:

```js
localStorage.getItem('token')
```

It also exports:

```js
getApiError(error, fallback)
```

This reads FastAPI error messages from:

```js
error.response?.data?.detail
```

### `frontend/src/context/AuthContext.jsx`

Central frontend authentication state.

Stores:

- `user`
- `loading`
- `isAdmin`
- `login()`
- `signup()`
- `logout()`

When the page reloads:

1. It checks `localStorage` for `token`.
2. If token exists, it calls `GET /auth/me`.
3. If token is valid, user is restored.
4. If token is invalid, token is removed.

### `frontend/src/components/ProtectedRoute.jsx`

Protects routes from unauthenticated users.

If user is not logged in:

```txt
redirect to /login
```

### `frontend/src/components/Navbar.jsx`

Shows navigation links and logout.

Uses auth state to show:

- Dashboard
- Projects
- Tasks
- Current user
- Logout

### `frontend/src/pages/Signup.jsx`

Signup page.

Sends:

```http
POST /api/auth/signup
```

Payload:

```json
{
  "name": "Demo Admin",
  "email": "admin@demo.com",
  "password": "password123",
  "role": "ADMIN"
}
```

After signup:

- Backend returns `user` and `token`.
- Frontend saves token in `localStorage`.
- Frontend redirects to dashboard.

### `frontend/src/pages/Login.jsx`

Login page.

Sends:

```http
POST /api/auth/login
```

After login:

- Backend returns `user` and `token`.
- Frontend saves token in `localStorage`.
- Frontend redirects to dashboard.

### `frontend/src/pages/Dashboard.jsx`

Dashboard page.

Sends:

```http
GET /api/dashboard
```

Shows:

- Total tasks
- Todo tasks
- In progress tasks
- Completed tasks
- Overdue tasks
- Total projects

Admin sees all counts.

Member sees only assigned data.

### `frontend/src/pages/Projects.jsx`

Project list page.

Sends:

```http
GET /api/projects
POST /api/projects
DELETE /api/projects/:id
```

Admin:

- Can create projects.
- Can delete projects.
- Can open project details.

Member:

- Can only see projects where they are added as member.
- Cannot create/delete projects.

### `frontend/src/pages/ProjectDetails.jsx`

Project details page.

Sends:

```http
GET /api/projects/:id
PUT /api/projects/:id
POST /api/projects/:id/members
```

Admin:

- Can edit project.
- Can add members by email.
- Can see members.

Member:

- Can view accessible project details.
- Cannot edit project or add members.

### `frontend/src/pages/Tasks.jsx`

Task list page.

Sends:

```http
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
```

Admin:

- Can create tasks.
- Can assign tasks to project members.
- Can change task status.
- Can delete tasks.

Member:

- Can see assigned tasks.
- Can update only task status.

### `frontend/src/components/ProjectForm.jsx`

Reusable project form.

Used by:

- `Projects.jsx` for create project.
- `ProjectDetails.jsx` for edit project.

Payload shape:

```json
{
  "name": "Project name",
  "description": "Project description"
}
```

### `frontend/src/components/TaskForm.jsx`

Reusable task creation form.

Used by:

- `Tasks.jsx`

Payload shape:

```json
{
  "title": "Task title",
  "description": "Task description",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "2026-05-10",
  "projectId": "project_id_here",
  "assigneeId": "user_id_here"
}
```

## 6. Database Design and Relationships

### `users`

Stores user accounts.

Fields:

```txt
id          string primary key
name        string required
email       string unique required
password    hashed string required
role        ADMIN or MEMBER
created_at  datetime
updated_at  datetime
```

Relationships:

- User can own many projects.
- User can be member of many projects.
- User can be assigned many tasks.
- User can create many tasks.

### `projects`

Stores projects.

Fields:

```txt
id          string primary key
name        string required
description text optional
owner_id    foreign key -> users.id
created_at  datetime
updated_at  datetime
```

Relationships:

- Project belongs to one owner/admin.
- Project has many members.
- Project has many tasks.

### `project_members`

Join table between users and projects.

Fields:

```txt
id          string primary key
project_id  foreign key -> projects.id
user_id     foreign key -> users.id
created_at  datetime
```

Constraint:

```txt
One user cannot be added to the same project twice.
```

### `tasks`

Stores tasks.

Fields:

```txt
id             string primary key
title          string required
description    text optional
status         TODO / IN_PROGRESS / DONE
priority       LOW / MEDIUM / HIGH
due_date       datetime optional
project_id     foreign key -> projects.id
assignee_id    foreign key -> users.id
created_by_id  foreign key -> users.id
created_at     datetime
updated_at     datetime
```

Important validation:

```txt
Task assignee must be a member of the selected project.
```

## 7. Authentication Flow

### Signup

Real flow:

1. User opens `/signup`.
2. React renders `Signup.jsx`.
3. User enters name, email, password, and role.
4. `Signup.jsx` calls `signup(form)` from `AuthContext.jsx`.
5. `AuthContext.jsx` sends `POST /auth/signup` through `axios.js`.
6. `axios.js` sends request to backend API base URL.
7. Backend route `auth.py` receives request.
8. Pydantic validates payload using `UserCreate`.
9. Backend checks if email already exists.
10. Backend hashes password using `security.py`.
11. Backend creates user in `users` table.
12. Backend creates JWT token.
13. Backend returns user and token.
14. Frontend saves token in `localStorage`.
15. User is redirected to dashboard.

### Login

Real flow:

1. User opens `/login`.
2. React renders `Login.jsx`.
3. User enters email and password.
4. `Login.jsx` calls `login(form)` from `AuthContext.jsx`.
5. `AuthContext.jsx` sends `POST /auth/login`.
6. Backend finds user by email.
7. Backend verifies password hash.
8. Backend returns user and token.
9. Frontend stores token.
10. Frontend redirects to dashboard.

### Authenticated Requests

For every protected API request:

1. Frontend calls `api.get()`, `api.post()`, `api.put()`, or `api.delete()`.
2. Axios interceptor in `axios.js` reads token from `localStorage`.
3. Axios adds header:

```http
Authorization: Bearer <token>
```

4. Backend dependency `get_current_user()` reads the token.
5. Backend decodes JWT.
6. Backend loads current user from database.
7. Route continues only if token and user are valid.

## 8. Role-Based Access Control

### Admin Rules

Admin can:

- Create projects.
- View all projects.
- View any project details.
- Update projects.
- Delete projects.
- Add members to projects.
- Create tasks.
- Assign tasks.
- View all tasks.
- Update any task.
- Delete tasks.
- View global dashboard counts.

Backend implementation:

- Admin-only routes use `Depends(require_admin)`.
- Admin checks happen in `backend/app/dependencies.py`.

### Member Rules

Member can:

- View only projects where they are in `project_members`.
- View only assigned tasks.
- Update only `status` of their assigned tasks.
- View personal dashboard counts only.

Member cannot:

- Create projects.
- Edit projects.
- Delete projects.
- Add project members.
- Create tasks.
- Delete tasks.
- Update task title, project, assignee, description, priority, or due date.

## 9. API Base Rules

Local API base:

```txt
http://localhost:8000/api
```

Live API base:

```txt
https://backend-production-f6a9.up.railway.app/api
```

All API requests except signup/login/me need:

```http
Authorization: Bearer <token>
```

Actually:

- `/auth/signup` does not need token.
- `/auth/login` does not need token.
- `/auth/me` needs token.
- `/projects` needs token.
- `/tasks` needs token.
- `/dashboard` needs token.

## 10. API Schemas

These are the exact payload shapes accepted by the backend.

### `UserCreate`

Used by:

```txt
POST /api/auth/signup
```

JSON:

```json
{
  "name": "Demo Admin",
  "email": "admin@demo.com",
  "password": "password123",
  "role": "ADMIN"
}
```

Validation:

- `name`: required, minimum length 1
- `email`: required, valid email
- `password`: required, minimum length 6
- `role`: optional, default `MEMBER`, allowed `ADMIN` or `MEMBER`

### `UserLogin`

Used by:

```txt
POST /api/auth/login
```

JSON:

```json
{
  "email": "admin@demo.com",
  "password": "password123"
}
```

Validation:

- `email`: required, valid email
- `password`: required

### `ProjectCreate`

Used by:

```txt
POST /api/projects
```

JSON:

```json
{
  "name": "Demo Project",
  "description": "Railway deployment verification"
}
```

Validation:

- `name`: required, minimum length 1
- `description`: optional

### `ProjectUpdate`

Used by:

```txt
PUT /api/projects/:projectId
```

JSON:

```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

Validation:

- `name`: optional, but if provided cannot be empty
- `description`: optional

### `AddMemberRequest`

Used by:

```txt
POST /api/projects/:projectId/members
```

Add by email:

```json
{
  "email": "member@demo.com"
}
```

Add by user ID:

```json
{
  "userId": "user_id_here"
}
```

Validation:

- At least one of `email` or `userId` is required.
- User must exist.
- User cannot already be a member of the same project.

### `TaskCreate`

Used by:

```txt
POST /api/tasks
```

JSON:

```json
{
  "title": "Verify Railway deployment",
  "description": "Demo task created after deployment",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-05-10T00:00:00.000Z",
  "projectId": "project_id_here",
  "assigneeId": "user_id_here"
}
```

Validation:

- `title`: required, minimum length 1
- `description`: optional
- `status`: optional, default `TODO`
- `priority`: optional, default `MEDIUM`
- `dueDate`: optional datetime
- `projectId`: required
- `assigneeId`: required
- `assigneeId` must belong to the selected project through `project_members`

Allowed statuses:

```txt
TODO
IN_PROGRESS
DONE
```

Allowed priorities:

```txt
LOW
MEDIUM
HIGH
```

### `TaskUpdate`

Used by:

```txt
PUT /api/tasks/:taskId
```

Admin can send any combination:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  "dueDate": "2026-05-12T00:00:00.000Z",
  "projectId": "project_id_here",
  "assigneeId": "user_id_here"
}
```

Member can send only:

```json
{
  "status": "DONE"
}
```

If a member sends anything other than only `status`, backend returns `403`.

## 11. API Response Structures

### User Response

```json
{
  "id": "user_id",
  "name": "Demo Admin",
  "email": "admin@demo.com",
  "role": "ADMIN",
  "createdAt": "2026-05-01T08:20:14.229619+00:00",
  "updatedAt": "2026-05-01T08:20:14.229619+00:00"
}
```

### Auth Response

```json
{
  "user": {
    "id": "user_id",
    "name": "Demo Admin",
    "email": "admin@demo.com",
    "role": "ADMIN",
    "createdAt": "2026-05-01T08:20:14.229619+00:00",
    "updatedAt": "2026-05-01T08:20:14.229619+00:00"
  },
  "token": "jwt_token_here"
}
```

### Project Response

```json
{
  "project": {
    "id": "project_id",
    "name": "Demo Project",
    "description": "Railway deployment verification",
    "ownerId": "owner_user_id",
    "createdAt": "2026-05-01T08:21:01.377216+00:00",
    "updatedAt": "2026-05-01T08:21:01.377216+00:00",
    "owner": {
      "id": "owner_user_id",
      "name": "Demo Admin",
      "email": "admin@demo.com",
      "role": "ADMIN",
      "createdAt": "2026-05-01T08:20:14.229619+00:00",
      "updatedAt": "2026-05-01T08:20:14.229619+00:00"
    },
    "members": [],
    "tasks": []
  }
}
```

### Projects List Response

```json
{
  "projects": [
    {
      "id": "project_id",
      "name": "Demo Project",
      "description": "Railway deployment verification",
      "ownerId": "owner_user_id",
      "createdAt": "2026-05-01T08:21:01.377216+00:00",
      "updatedAt": "2026-05-01T08:21:01.377216+00:00",
      "owner": {},
      "members": [],
      "tasks": []
    }
  ]
}
```

### Project Member Response

```json
{
  "member": {
    "id": "membership_id",
    "projectId": "project_id",
    "userId": "member_user_id",
    "createdAt": "2026-05-01T08:21:30.388961+00:00",
    "user": {
      "id": "member_user_id",
      "name": "Demo Member",
      "email": "member@demo.com",
      "role": "MEMBER",
      "createdAt": "2026-05-01T08:20:34.428236+00:00",
      "updatedAt": "2026-05-01T08:20:34.428236+00:00"
    }
  }
}
```

### Task Response

```json
{
  "task": {
    "id": "task_id",
    "title": "Verify Railway deployment",
    "description": "Demo task created after deployment",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": null,
    "projectId": "project_id",
    "assigneeId": "member_user_id",
    "createdById": "admin_user_id",
    "createdAt": "2026-05-01T08:21:40.197089+00:00",
    "updatedAt": "2026-05-01T08:21:40.197089+00:00",
    "project": {
      "id": "project_id",
      "name": "Demo Project",
      "description": "Railway deployment verification",
      "ownerId": "admin_user_id",
      "createdAt": "2026-05-01T08:21:01.377216+00:00",
      "updatedAt": "2026-05-01T08:21:01.377216+00:00"
    },
    "assignee": {
      "id": "member_user_id",
      "name": "Demo Member",
      "email": "member@demo.com",
      "role": "MEMBER",
      "createdAt": "2026-05-01T08:20:34.428236+00:00",
      "updatedAt": "2026-05-01T08:20:34.428236+00:00"
    },
    "createdBy": {
      "id": "admin_user_id",
      "name": "Demo Admin",
      "email": "admin@demo.com",
      "role": "ADMIN",
      "createdAt": "2026-05-01T08:20:14.229619+00:00",
      "updatedAt": "2026-05-01T08:20:14.229619+00:00"
    }
  }
}
```

### Tasks List Response

```json
{
  "tasks": [
    {
      "id": "task_id",
      "title": "Verify Railway deployment",
      "description": "Demo task created after deployment",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": null,
      "projectId": "project_id",
      "assigneeId": "member_user_id",
      "createdById": "admin_user_id",
      "createdAt": "2026-05-01T08:21:40.197089+00:00",
      "updatedAt": "2026-05-01T08:21:40.197089+00:00",
      "project": {},
      "assignee": {},
      "createdBy": {}
    }
  ]
}
```

### Dashboard Response

```json
{
  "totalTasks": 1,
  "todoTasks": 1,
  "inProgressTasks": 0,
  "doneTasks": 0,
  "overdueTasks": 0,
  "totalProjects": 1
}
```

## 12. Complete Real User Flow

This is the normal real-world flow from start to finish.

### Step 1: Admin signs up

Frontend:

- File: `frontend/src/pages/Signup.jsx`
- Auth function: `frontend/src/context/AuthContext.jsx`
- Axios client: `frontend/src/api/axios.js`

Backend:

- Route file: `backend/app/routers/auth.py`
- Schema: `UserCreate`
- Model: `User`
- Security: `hash_password()`, `create_access_token()`

Database:

- Insert row into `users`.

Request:

```http
POST /api/auth/signup
```

Payload:

```json
{
  "name": "Demo Admin",
  "email": "admin@demo.com",
  "password": "password123",
  "role": "ADMIN"
}
```

Result:

- Admin user created.
- JWT token returned.
- Frontend stores token.

### Step 2: Member signs up

Same files as admin signup.

Payload:

```json
{
  "name": "Demo Member",
  "email": "member@demo.com",
  "password": "password123",
  "role": "MEMBER"
}
```

Result:

- Member user created.

### Step 3: Admin creates a project

Frontend:

- Page: `frontend/src/pages/Projects.jsx`
- Form: `frontend/src/components/ProjectForm.jsx`
- API client: `frontend/src/api/axios.js`

Backend:

- Route: `backend/app/routers/projects.py`
- Schema: `ProjectCreate`
- Model: `Project`
- Auth dependency: `require_admin()`

Database:

- Insert row into `projects`.

Request:

```http
POST /api/projects
Authorization: Bearer <admin_token>
```

Payload:

```json
{
  "name": "Demo Project",
  "description": "Railway deployment verification"
}
```

Result:

- Project created.
- Admin becomes project owner.

### Step 4: Admin adds member to project

Frontend:

- Page: `frontend/src/pages/ProjectDetails.jsx`

Backend:

- Route: `backend/app/routers/projects.py`
- Schema: `AddMemberRequest`
- Model: `ProjectMember`
- Auth dependency: `require_admin()`

Database:

- Insert row into `project_members`.

Request:

```http
POST /api/projects/:projectId/members
Authorization: Bearer <admin_token>
```

Payload:

```json
{
  "email": "member@demo.com"
}
```

Result:

- Member is linked to project.
- Member can now see this project.
- Member can be assigned tasks in this project.

### Step 5: Admin creates and assigns task

Frontend:

- Page: `frontend/src/pages/Tasks.jsx`
- Form: `frontend/src/components/TaskForm.jsx`

Backend:

- Route: `backend/app/routers/tasks.py`
- Schema: `TaskCreate`
- Model: `Task`
- Auth dependency: `require_admin()`

Database:

- Insert row into `tasks`.

Validation:

- Project must exist.
- Assignee must exist.
- Assignee must be a member of selected project.

Request:

```http
POST /api/tasks
Authorization: Bearer <admin_token>
```

Payload:

```json
{
  "title": "Verify Railway deployment",
  "description": "Demo task created after deployment",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": null,
  "projectId": "project_id_here",
  "assigneeId": "member_user_id_here"
}
```

Result:

- Task created.
- Task is linked to project.
- Task is assigned to member.
- Task creator is admin.

### Step 6: Member logs in and views assigned tasks

Frontend:

- Page: `frontend/src/pages/Login.jsx`
- Page: `frontend/src/pages/Tasks.jsx`

Backend:

- Route: `backend/app/routers/auth.py`
- Route: `backend/app/routers/tasks.py`

Request:

```http
GET /api/tasks
Authorization: Bearer <member_token>
```

Backend behavior:

```py
if current_user.role != Role.ADMIN:
    query = query.filter(Task.assignee_id == current_user.id)
```

Result:

- Member sees only tasks assigned to them.

### Step 7: Member updates task status

Frontend:

- Page: `frontend/src/pages/Tasks.jsx`

Backend:

- Route: `backend/app/routers/tasks.py`
- Schema: `TaskUpdate`

Request:

```http
PUT /api/tasks/:taskId
Authorization: Bearer <member_token>
```

Payload:

```json
{
  "status": "IN_PROGRESS"
}
```

Backend member validation:

- Task must be assigned to current member.
- Payload keys must be exactly `{"status"}`.

Result:

- Task status updated.

If member sends this:

```json
{
  "title": "Changed title",
  "status": "DONE"
}
```

Backend rejects with:

```json
{
  "detail": "Members can update only task status"
}
```

### Step 8: Dashboard loads

Frontend:

- Page: `frontend/src/pages/Dashboard.jsx`
- Component: `frontend/src/components/StatCard.jsx`

Backend:

- Route: `backend/app/routers/dashboard.py`

Request:

```http
GET /api/dashboard
Authorization: Bearer <token>
```

Admin dashboard:

- Counts all projects.
- Counts all tasks.

Member dashboard:

- Counts only assigned tasks.
- Counts only projects where user is member.

## 13. Full Curl Commands

Set live API base:

```bash
API="https://backend-production-f6a9.up.railway.app/api"
```

### Health Check

```bash
curl https://backend-production-f6a9.up.railway.app/health
```

Expected:

```json
{
  "status": "ok"
}
```

### Admin Signup

```bash
curl -X POST "$API/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Admin",
    "email": "admin@demo.com",
    "password": "password123",
    "role": "ADMIN"
  }'
```

### Member Signup

```bash
curl -X POST "$API/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Member",
    "email": "member@demo.com",
    "password": "password123",
    "role": "MEMBER"
  }'
```

### Admin Login

```bash
curl -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "password123"
  }'
```

Copy the returned token:

```bash
ADMIN_TOKEN="paste_admin_token_here"
```

### Member Login

```bash
curl -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@demo.com",
    "password": "password123"
  }'
```

Copy the returned token:

```bash
MEMBER_TOKEN="paste_member_token_here"
```

### Get Current User

```bash
curl "$API/auth/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Create Project

```bash
curl -X POST "$API/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Demo Project",
    "description": "Railway deployment verification"
  }'
```

Copy project ID:

```bash
PROJECT_ID="paste_project_id_here"
```

### Get Projects

Admin:

```bash
curl "$API/projects" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Member:

```bash
curl "$API/projects" \
  -H "Authorization: Bearer $MEMBER_TOKEN"
```

### Get Project Details

```bash
curl "$API/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Update Project

```bash
curl -X PUT "$API/projects/$PROJECT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Updated Demo Project",
    "description": "Updated project description"
  }'
```

### Add Member to Project by Email

```bash
curl -X POST "$API/projects/$PROJECT_ID/members" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "member@demo.com"
  }'
```

### Add Member to Project by User ID

```bash
curl -X POST "$API/projects/$PROJECT_ID/members" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "userId": "member_user_id_here"
  }'
```

### Create Task

```bash
curl -X POST "$API/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Verify Railway deployment",
    "description": "Demo task created after deployment",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": null,
    "projectId": "paste_project_id_here",
    "assigneeId": "paste_member_user_id_here"
  }'
```

Copy task ID:

```bash
TASK_ID="paste_task_id_here"
```

### Get Tasks

Admin:

```bash
curl "$API/tasks" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Member:

```bash
curl "$API/tasks" \
  -H "Authorization: Bearer $MEMBER_TOKEN"
```

### Get One Task

```bash
curl "$API/tasks/$TASK_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Admin Update Task

```bash
curl -X PUT "$API/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Verify Railway deployment",
    "description": "Updated task description",
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "dueDate": "2026-05-10T00:00:00.000Z",
    "projectId": "paste_project_id_here",
    "assigneeId": "paste_member_user_id_here"
  }'
```

### Member Update Task Status

```bash
curl -X PUT "$API/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{
    "status": "DONE"
  }'
```

### Get Dashboard

Admin:

```bash
curl "$API/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Member:

```bash
curl "$API/dashboard" \
  -H "Authorization: Bearer $MEMBER_TOKEN"
```

### Delete Task

Admin only:

```bash
curl -X DELETE "$API/tasks/$TASK_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected:

```json
{
  "message": "Task deleted successfully"
}
```

### Delete Project

Admin only:

```bash
curl -X DELETE "$API/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected:

```json
{
  "message": "Project deleted successfully"
}
```

## 14. Frontend-to-Backend Request Flow by Page

### Signup Page

File:

```txt
frontend/src/pages/Signup.jsx
```

Request:

```txt
POST /auth/signup
```

Actual Axios call:

```js
api.post('/auth/signup', payload)
```

Backend file:

```txt
backend/app/routers/auth.py
```

Database table:

```txt
users
```

### Login Page

File:

```txt
frontend/src/pages/Login.jsx
```

Request:

```txt
POST /auth/login
```

Actual Axios call:

```js
api.post('/auth/login', credentials)
```

Backend file:

```txt
backend/app/routers/auth.py
```

Database table:

```txt
users
```

### Dashboard Page

File:

```txt
frontend/src/pages/Dashboard.jsx
```

Request:

```txt
GET /dashboard
```

Actual Axios call:

```js
api.get('/dashboard')
```

Backend file:

```txt
backend/app/routers/dashboard.py
```

Database tables:

```txt
projects
project_members
tasks
```

### Projects Page

File:

```txt
frontend/src/pages/Projects.jsx
```

Requests:

```txt
GET /projects
POST /projects
DELETE /projects/:id
```

Backend file:

```txt
backend/app/routers/projects.py
```

Database tables:

```txt
projects
project_members
tasks
```

### Project Details Page

File:

```txt
frontend/src/pages/ProjectDetails.jsx
```

Requests:

```txt
GET /projects/:id
PUT /projects/:id
POST /projects/:id/members
```

Backend file:

```txt
backend/app/routers/projects.py
```

Database tables:

```txt
projects
project_members
users
tasks
```

### Tasks Page

File:

```txt
frontend/src/pages/Tasks.jsx
```

Requests:

```txt
GET /tasks
GET /projects
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id
```

Important frontend behavior:

- `Tasks.jsx` loads tasks and projects together.
- Projects are needed so the task form can show available projects and project members.

Backend files:

```txt
backend/app/routers/tasks.py
backend/app/routers/projects.py
```

Database tables:

```txt
tasks
projects
project_members
users
```

## 15. Error Handling

Backend errors use FastAPI `HTTPException`.

Common error shape:

```json
{
  "detail": "Error message here"
}
```

Frontend reads errors using:

```js
getApiError(requestError, 'Fallback message')
```

File:

```txt
frontend/src/api/axios.js
```

Examples:

Duplicate signup:

```json
{
  "detail": "Email is already registered"
}
```

Invalid login:

```json
{
  "detail": "Invalid email or password"
}
```

No token:

```json
{
  "detail": "Authentication token is required"
}
```

Member trying admin-only action:

```json
{
  "detail": "You do not have permission to perform this action"
}
```

Assignee not project member:

```json
{
  "detail": "Assignee must be a member of the project"
}
```

## 16. Deployment Flow

Railway services:

```txt
Postgres
backend
frontend
```

Backend service:

- Root deployed from `backend/`
- Uses `backend/requirements.txt`
- Starts with `backend/Procfile`
- Runtime command:

```bash
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Backend Railway variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<secret value>
CORS_ORIGINS=https://frontend-production-d08f.up.railway.app
```

Frontend service:

- Root deployed from `frontend/`
- Build command:

```bash
npm run build
```

- Start command:

```bash
npm run start
```

Frontend Railway variables:

```env
VITE_API_URL=https://backend-production-f6a9.up.railway.app/api
```

Important deployment fix:

File:

```txt
frontend/vite.config.js
```

Config:

```js
preview: {
  allowedHosts: ['.up.railway.app'],
}
```

This allows Vite preview to respond on the Railway public domain.

## 17. Railway Postgres Connection and Database Visualization

This project uses Railway PostgreSQL for the deployed/live database.

The live frontend does not connect to the database directly. The live backend connects to Railway Postgres through the `DATABASE_URL` environment variable.

### 17.1 Railway Services Created

Three Railway services were created:

```txt
team-task-manager
├── Postgres
├── backend
└── frontend
```

Meaning:

- `Postgres` stores the live app data.
- `backend` is the FastAPI API server.
- `frontend` is the React app.

The connection path is:

```txt
Browser
-> React frontend on Railway
-> FastAPI backend on Railway
-> Railway Postgres database
```

The frontend never uses database credentials.

### 17.2 How Backend Was Connected to Railway Postgres

In Railway, the backend service has this variable:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

This is a Railway variable reference.

It means:

```txt
Use the DATABASE_URL provided by the Postgres service.
```

Railway automatically resolves it at runtime into a real Postgres connection string, similar to:

```txt
postgresql://username:password@host:port/database
```

The real value should not be committed to GitHub because it contains database credentials.

### 17.3 Where Backend Reads the Database URL

File:

```txt
backend/app/config.py
```

Code concept:

```py
database_url = os.getenv("DATABASE_URL", "sqlite:///./team_task_manager.db")
```

Meaning:

- If Railway provides `DATABASE_URL`, backend uses Railway Postgres.
- If running locally without `DATABASE_URL`, backend uses SQLite fallback.

### 17.4 How SQLAlchemy Creates the Database Connection

File:

```txt
backend/app/database.py
```

Important behavior:

```py
def normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url
```

Why this exists:

- Railway/Postgres URLs may start with `postgres://` or `postgresql://`.
- SQLAlchemy with psycopg2 expects `postgresql+psycopg2://`.
- This function converts the URL into the correct format.

Then SQLAlchemy creates the engine:

```py
engine = create_engine(normalize_database_url(settings.database_url))
```

Then each request gets a database session through:

```py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Every router uses this dependency:

```py
db: Session = Depends(get_db)
```

### 17.5 How Tables Are Created in Railway Postgres

File:

```txt
backend/app/main.py
```

On backend startup:

```py
Base.metadata.create_all(bind=engine)
```

This tells SQLAlchemy:

```txt
Create all tables defined in backend/app/models.py if they do not already exist.
```

Tables created:

```txt
users
projects
project_members
tasks
```

This is why after deployment, when the backend starts, Railway Postgres automatically gets the required tables.

### 17.6 What Gets Stored in Railway Postgres

When a user signs up:

```txt
users table gets a new row
```

When admin creates a project:

```txt
projects table gets a new row
```

When admin adds a member:

```txt
project_members table gets a new row
```

When admin creates a task:

```txt
tasks table gets a new row
```

Example storage flow:

```txt
POST /api/auth/signup
-> users

POST /api/projects
-> projects

POST /api/projects/:id/members
-> project_members

POST /api/tasks
-> tasks
```

### 17.7 How to View Railway Postgres from Terminal

Use Railway CLI:

```bash
npx @railway/cli connect Postgres
```

This opens a `psql` shell connected to the live Railway Postgres database.

List tables:

```sql
\dt
```

View users:

```sql
SELECT id, name, email, role, created_at FROM users;
```

View projects:

```sql
SELECT id, name, description, owner_id, created_at FROM projects;
```

View project members:

```sql
SELECT id, project_id, user_id, created_at FROM project_members;
```

View tasks:

```sql
SELECT id, title, status, priority, project_id, assignee_id, created_by_id, due_date, created_at
FROM tasks;
```

Exit:

```sql
\q
```

### 17.8 Better Joined Queries for Visualization

Project members with project and user names:

```sql
SELECT
  p.name AS project,
  u.name AS member,
  u.email,
  u.role,
  pm.created_at
FROM project_members pm
JOIN projects p ON p.id = pm.project_id
JOIN users u ON u.id = pm.user_id
ORDER BY pm.created_at DESC;
```

Tasks with project, assignee, and creator:

```sql
SELECT
  t.title,
  t.status,
  t.priority,
  p.name AS project,
  assignee.name AS assignee,
  creator.name AS created_by,
  t.due_date,
  t.created_at
FROM tasks t
JOIN projects p ON p.id = t.project_id
JOIN users assignee ON assignee.id = t.assignee_id
JOIN users creator ON creator.id = t.created_by_id
ORDER BY t.created_at DESC;
```

Dashboard-like task counts:

```sql
SELECT
  COUNT(*) AS total_tasks,
  COUNT(*) FILTER (WHERE status = 'TODO') AS todo_tasks,
  COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress_tasks,
  COUNT(*) FILTER (WHERE status = 'DONE') AS done_tasks,
  COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'DONE') AS overdue_tasks
FROM tasks;
```

### 17.9 How to View Railway Postgres in a GUI

In the screenshot, VS Code is connecting to:

```txt
127.0.0.1:5432
```

That is local PostgreSQL, not Railway Postgres.

To view Railway Postgres in a GUI:

1. Open Railway dashboard.
2. Open project `team-task-manager`.
3. Open the `Postgres` service.
4. Go to variables/connect tab.
5. Copy the public connection details if Railway provides public TCP/proxy access.
6. In the VS Code database extension, create a PostgreSQL connection using:

```txt
Host: Railway public host
Port: Railway public port
Database: Railway database name
Username: Railway database user
Password: Railway database password
SSL: enabled if required
```

Important:

If the host is:

```txt
postgres.railway.internal
```

then it only works inside Railway services, not directly from your laptop.

For local GUI access, use Railway's public/proxy connection details or use:

```bash
npx @railway/cli connect Postgres
```

### 17.10 How to Know Data Is Being Stored Correctly

Create data from the frontend:

```txt
https://frontend-production-d08f.up.railway.app
```

Then inspect database:

```bash
npx @railway/cli connect Postgres
```

Run:

```sql
SELECT email, role FROM users;
SELECT name, owner_id FROM projects;
SELECT project_id, user_id FROM project_members;
SELECT title, status, assignee_id FROM tasks;
```

If rows appear after using the app, the full storage flow is working:

```txt
Frontend action
-> backend API
-> SQLAlchemy
-> Railway Postgres
-> database row
```

## 18. Why Backend Root Shows Not Found

Opening this URL:

```txt
https://backend-production-f6a9.up.railway.app
```

returns:

```json
{
  "detail": "Not Found"
}
```

This is expected because the backend is an API, not a website homepage.

Use:

```txt
https://backend-production-f6a9.up.railway.app/health
```

for health check.

Use:

```txt
https://frontend-production-d08f.up.railway.app
```

for the real user-facing app.

## 19. End-to-End Knowledge Summary

The frontend never talks directly to the database.

Frontend flow:

```txt
React page -> AuthContext or page handler -> Axios client -> HTTP request
```

Backend flow:

```txt
FastAPI router -> Pydantic schema validation -> Auth dependency -> SQLAlchemy query -> Serializer -> JSON response
```

Database flow:

```txt
SQLAlchemy model -> PostgreSQL table row
```

Complete example:

```txt
User clicks Create Task
-> TaskForm builds JSON payload
-> Tasks.jsx calls api.post('/tasks', payload)
-> axios.js adds Authorization header
-> FastAPI receives POST /api/tasks
-> TaskCreate validates payload
-> require_admin checks JWT and role
-> tasks.py verifies project exists
-> tasks.py verifies assignee exists
-> tasks.py verifies assignee is project member
-> SQLAlchemy inserts task row
-> serializers.py formats response
-> frontend receives task JSON
-> Tasks.jsx reloads task list
-> user sees new task in UI
```

This is the core pattern used throughout the project.

## 20. Very Detailed Railway Setup Notes

This section explains the exact deployment and database connection process at a smaller level.

### 20.1 Railway Login

Railway CLI was used through `npx`, so no global installation was required.

Command:

```bash
npx @railway/cli login --browserless
```

Railway printed an activation code and URL:

```txt
https://railway.com/activate
```

After entering the code in the browser, CLI became authenticated.

Check logged-in user:

```bash
npx @railway/cli whoami
```

Expected output format:

```txt
Logged in as Sajjan Singh (sajjanbhk6@gmail.com)
```

### 20.2 Railway Project Creation

Command used:

```bash
npx @railway/cli init --name team-task-manager --json
```

This created a Railway project:

```txt
team-task-manager
```

Railway project ID:

```txt
12a091ce-0f58-48cf-811f-7d57b5a1bf89
```

Check project link:

```bash
npx @railway/cli status
```

If the directory is not linked, Railway says:

```txt
No linked project found. Run railway link to connect to a project
```

After `railway init`, this project directory is linked to the Railway project.

### 20.3 Adding Railway Postgres

Command used:

```bash
npx @railway/cli add --database postgres --json
```

Created service:

```txt
Postgres
```

Service ID:

```txt
fe07e912-4a12-4719-960e-0b79a580b8f9
```

This service automatically provides database variables such as:

```txt
DATABASE_URL
PGHOST
PGPORT
PGUSER
PGPASSWORD
PGDATABASE
```

The backend uses `DATABASE_URL`.

### 20.4 Adding Backend Service

Command used:

```bash
npx @railway/cli add --service backend --json
```

Created service:

```txt
backend
```

Service ID:

```txt
cc49aa36-489e-4090-b32e-f9e092569d72
```

This service runs the FastAPI app.

### 20.5 Adding Frontend Service

Command used:

```bash
npx @railway/cli add --service frontend --json
```

Created service:

```txt
frontend
```

Service ID:

```txt
fab810a5-4fd9-4ed5-9de7-bb6f0fe6eeb5
```

This service runs the React/Vite frontend.

### 20.6 Backend Environment Variables

Backend variables were set with:

```bash
npx @railway/cli variable set \
  --service backend \
  'DATABASE_URL=${{Postgres.DATABASE_URL}}' \
  JWT_SECRET=<random_secret> \
  CORS_ORIGINS=https://frontend-production-d08f.up.railway.app
```

Meaning of each variable:

```txt
DATABASE_URL
```

This is the live Postgres connection string. It is injected from the Railway `Postgres` service.

```txt
JWT_SECRET
```

This signs and verifies JWT tokens. If this changes, old tokens become invalid.

```txt
CORS_ORIGINS
```

This tells FastAPI which frontend URL is allowed to call the backend from a browser.

### 20.7 Frontend Environment Variables

Frontend variable:

```env
VITE_API_URL=https://backend-production-f6a9.up.railway.app/api
```

This is important because Vite injects `VITE_` variables at build time.

Meaning:

```txt
When frontend code calls api.get('/tasks'),
it becomes:
https://backend-production-f6a9.up.railway.app/api/tasks
```

If this variable is wrong, the frontend will open but API calls will fail.

### 20.8 Backend Deployment Command

Command used:

```bash
npx @railway/cli up backend --service backend --path-as-root --detach --message backend-initial-deploy
```

Important details:

```txt
backend
```

The folder being uploaded.

```txt
--service backend
```

Tells Railway to deploy into the backend service.

```txt
--path-as-root
```

Makes the `backend/` folder behave as the root folder during deployment.

This matters because Railway needs to see:

```txt
requirements.txt
Procfile
main.py
```

inside the deployment root.

### 20.9 Frontend Deployment Command

Command used:

```bash
npx @railway/cli up frontend --service frontend --path-as-root --detach --message frontend-initial-deploy
```

Important details:

```txt
frontend
```

The folder being uploaded.

```txt
--service frontend
```

Tells Railway to deploy into the frontend service.

```txt
--path-as-root
```

Makes the `frontend/` folder the deployment root.

Railway then sees:

```txt
package.json
package-lock.json
vite.config.js
src/
```

### 20.10 Railway Public Domains

Backend domain:

```bash
npx @railway/cli domain --service backend --port 8080 --json
```

Generated:

```txt
https://backend-production-f6a9.up.railway.app
```

Frontend domain:

```bash
npx @railway/cli domain --service frontend --port 8080 --json
```

Generated:

```txt
https://frontend-production-d08f.up.railway.app
```

Railway provides `$PORT` dynamically. In this deployment, containers ran on port `8080`.

## 21. Very Detailed Request Lifecycle

This section explains exactly what happens when a request moves from browser to backend to database.

### 21.1 Browser Loads Frontend

User opens:

```txt
https://frontend-production-d08f.up.railway.app
```

Railway frontend service returns:

```txt
index.html
compiled JavaScript bundle
compiled CSS bundle
```

React starts in the browser.

File used first:

```txt
frontend/src/main.jsx
```

Then React renders:

```txt
frontend/src/App.jsx
```

### 21.2 App Router Decides Which Page to Show

File:

```txt
frontend/src/App.jsx
```

If path is:

```txt
/login
```

React renders:

```txt
Login.jsx
```

If path is:

```txt
/signup
```

React renders:

```txt
Signup.jsx
```

If path is protected, React uses:

```txt
ProtectedRoute.jsx
```

Protected paths:

```txt
/
/projects
/projects/:id
/tasks
```

### 21.3 AuthContext Restores User

File:

```txt
frontend/src/context/AuthContext.jsx
```

On page refresh:

```js
const token = localStorage.getItem('token')
```

If token exists:

```js
api.get('/auth/me')
```

Actual deployed URL:

```txt
https://backend-production-f6a9.up.railway.app/api/auth/me
```

If token is valid:

```txt
user state is set
```

If token is invalid:

```txt
token is removed from localStorage
user becomes null
```

### 21.4 Axios Adds JWT Header

File:

```txt
frontend/src/api/axios.js
```

Before every API request:

```js
const token = localStorage.getItem('token')
```

If token exists, Axios sends:

```http
Authorization: Bearer <token>
```

This means pages do not manually add the token every time.

### 21.5 FastAPI Receives Request

File:

```txt
backend/app/main.py
```

FastAPI receives the HTTP request and matches it to a router:

```txt
/api/auth/*      -> auth.py
/api/projects/*  -> projects.py
/api/tasks/*     -> tasks.py
/api/dashboard   -> dashboard.py
```

### 21.6 Pydantic Validates Payload

File:

```txt
backend/app/schemas.py
```

Example:

```txt
POST /api/tasks
```

uses:

```py
TaskCreate
```

If required fields are missing, FastAPI returns validation error before database logic runs.

Example invalid payload:

```json
{
  "description": "Missing title"
}
```

Expected error:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "title"],
      "msg": "Field required"
    }
  ]
}
```

### 21.7 Authentication Dependency Runs

File:

```txt
backend/app/dependencies.py
```

For protected routes:

```py
current_user: User = Depends(get_current_user)
```

This does:

```txt
Read Authorization header
Extract Bearer token
Decode JWT
Find user from users table
Return current_user
```

If token is missing:

```json
{
  "detail": "Authentication token is required"
}
```

If token is invalid:

```json
{
  "detail": "Invalid or expired token"
}
```

### 21.8 Admin Dependency Runs

For admin-only routes:

```py
current_user: User = Depends(require_admin)
```

This first authenticates the user, then checks:

```py
current_user.role == Role.ADMIN
```

If current user is a member:

```json
{
  "detail": "You do not have permission to perform this action"
}
```

HTTP status:

```txt
403 Forbidden
```

### 21.9 SQLAlchemy Talks to Railway Postgres

Every route gets:

```py
db: Session = Depends(get_db)
```

Example:

```py
db.query(User).filter(User.email == email).first()
```

This becomes a SQL query sent to Railway Postgres.

When creating data:

```py
db.add(model_object)
db.commit()
db.refresh(model_object)
```

Meaning:

```txt
db.add       -> prepare INSERT
db.commit    -> save to database permanently
db.refresh   -> reload generated/default fields like created_at
```

### 21.10 Serializer Builds Frontend-Friendly JSON

File:

```txt
backend/app/serializers.py
```

Database field:

```txt
created_at
```

API response field:

```txt
createdAt
```

Database field:

```txt
project_id
```

API response field:

```txt
projectId
```

This keeps the frontend JSON style consistent.

## 22. Very Detailed Table Storage Examples

This section explains exactly what gets inserted into each table during the app flow.

### 22.1 Signup Inserts Into `users`

API:

```txt
POST /api/auth/signup
```

Payload:

```json
{
  "name": "Demo Admin",
  "email": "admin@demo.com",
  "password": "password123",
  "role": "ADMIN"
}
```

Stored in `users`:

```txt
id          generated unique id
name        Demo Admin
email       admin@demo.com
password    hashed password, not plain password
role        ADMIN
created_at  database timestamp
updated_at  database timestamp
```

Important:

The database does not store:

```txt
password123
```

It stores a bcrypt hash.

Check:

```sql
SELECT id, name, email, role, password FROM users;
```

You will see password value like:

```txt
$2b$12$...
```

### 22.2 Project Creation Inserts Into `projects`

API:

```txt
POST /api/projects
```

Payload:

```json
{
  "name": "Demo Project",
  "description": "Railway deployment verification"
}
```

Stored in `projects`:

```txt
id           generated unique id
name         Demo Project
description  Railway deployment verification
owner_id     current admin user id
created_at   database timestamp
updated_at   database timestamp
```

The frontend does not send `owner_id`.

Backend sets it from:

```py
current_user.id
```

### 22.3 Adding Member Inserts Into `project_members`

API:

```txt
POST /api/projects/:projectId/members
```

Payload:

```json
{
  "email": "member@demo.com"
}
```

Backend steps:

```txt
Find project by URL projectId
Find user by email
Check duplicate membership
Insert row into project_members
```

Stored in `project_members`:

```txt
id          generated unique id
project_id  project id from URL
user_id     member user's id
created_at  database timestamp
```

Unique rule:

```txt
same project_id + same user_id cannot appear twice
```

### 22.4 Task Creation Inserts Into `tasks`

API:

```txt
POST /api/tasks
```

Payload:

```json
{
  "title": "Verify Railway deployment",
  "description": "Demo task created after deployment",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": null,
  "projectId": "project_id_here",
  "assigneeId": "member_user_id_here"
}
```

Stored in `tasks`:

```txt
id             generated unique id
title          Verify Railway deployment
description    Demo task created after deployment
status         TODO
priority       HIGH
due_date       null
project_id     project_id_here
assignee_id    member_user_id_here
created_by_id  current admin user id
created_at     database timestamp
updated_at     database timestamp
```

The frontend does not send:

```txt
createdById
```

Backend sets it from:

```py
current_user.id
```

### 22.5 Member Status Update Changes `tasks.status`

API:

```txt
PUT /api/tasks/:taskId
```

Payload:

```json
{
  "status": "IN_PROGRESS"
}
```

Stored change:

```txt
tasks.status changes from TODO to IN_PROGRESS
tasks.updated_at changes automatically
```

No new row is created.

The existing task row is updated.

## 23. Frontend State and Local Storage Details

### 23.1 What Gets Stored in Browser Local Storage

After signup/login, frontend stores:

```txt
token
```

Example:

```txt
localStorage["token"] = "eyJhbGciOiJIUzI1NiIs..."
```

The frontend does not store password.

The frontend does not store database credentials.

### 23.2 What Is Kept in React State

`AuthContext.jsx` keeps:

```txt
user
loading
isAdmin
```

Page components keep their own state.

Examples:

`Projects.jsx`:

```txt
projects
showForm
error
loading
```

`Tasks.jsx`:

```txt
tasks
projects
filter
showForm
error
loading
```

`ProjectDetails.jsx`:

```txt
project
memberEmail
editing
error
message
loading
```

### 23.3 Why Tasks Page Also Loads Projects

`Tasks.jsx` calls both:

```js
api.get('/tasks')
api.get('/projects')
```

Reason:

- `/tasks` gives current tasks.
- `/projects` gives projects and members.
- `TaskForm.jsx` needs project members to show assignee dropdown.

Without loading projects, the task creation form would not know which users can be assigned.

## 24. Endpoint-to-File-to-Database Map

| User Action | Frontend File | API Request | Backend File | Schema | Tables Used |
|---|---|---|---|---|---|
| Signup | `Signup.jsx` | `POST /api/auth/signup` | `auth.py` | `UserCreate` | `users` |
| Login | `Login.jsx` | `POST /api/auth/login` | `auth.py` | `UserLogin` | `users` |
| Restore session | `AuthContext.jsx` | `GET /api/auth/me` | `auth.py` | none | `users` |
| View dashboard | `Dashboard.jsx` | `GET /api/dashboard` | `dashboard.py` | none | `tasks`, `projects`, `project_members` |
| View projects | `Projects.jsx` | `GET /api/projects` | `projects.py` | none | `projects`, `project_members`, `tasks`, `users` |
| Create project | `ProjectForm.jsx` | `POST /api/projects` | `projects.py` | `ProjectCreate` | `projects` |
| View project details | `ProjectDetails.jsx` | `GET /api/projects/:id` | `projects.py` | none | `projects`, `project_members`, `tasks`, `users` |
| Edit project | `ProjectDetails.jsx` | `PUT /api/projects/:id` | `projects.py` | `ProjectUpdate` | `projects` |
| Add member | `ProjectDetails.jsx` | `POST /api/projects/:id/members` | `projects.py` | `AddMemberRequest` | `project_members`, `users`, `projects` |
| View tasks | `Tasks.jsx` | `GET /api/tasks` | `tasks.py` | none | `tasks`, `projects`, `users` |
| Create task | `TaskForm.jsx` | `POST /api/tasks` | `tasks.py` | `TaskCreate` | `tasks`, `projects`, `project_members`, `users` |
| Update task status | `Tasks.jsx` | `PUT /api/tasks/:id` | `tasks.py` | `TaskUpdate` | `tasks` |
| Delete task | `Tasks.jsx` | `DELETE /api/tasks/:id` | `tasks.py` | none | `tasks` |

## 25. Common Things to Check During Demo

### 25.1 Check Frontend Is Live

Open:

```txt
https://frontend-production-d08f.up.railway.app
```

Expected:

```txt
Login/signup UI appears.
```

### 25.2 Check Backend Is Live

Open:

```txt
https://backend-production-f6a9.up.railway.app/health
```

Expected:

```json
{
  "status": "ok"
}
```

### 25.3 Backend Root Not Found Is Fine

Opening:

```txt
https://backend-production-f6a9.up.railway.app
```

Expected:

```json
{
  "detail": "Not Found"
}
```

Reason:

```txt
The backend root route "/" is not implemented because this is an API service.
```

### 25.4 Check Railway Logs

Backend logs:

```bash
npx @railway/cli logs --service backend
```

Frontend logs:

```bash
npx @railway/cli logs --service frontend
```

Deployment status:

```bash
npx @railway/cli service status --service backend
npx @railway/cli service status --service frontend
```

### 25.5 Check Railway Variables

Backend variables:

```bash
npx @railway/cli variable list --service backend
```

Frontend variables:

```bash
npx @railway/cli variable list --service frontend
```

Postgres variables:

```bash
npx @railway/cli variable list --service Postgres
```

Do not paste secrets in README or public places.

## 26. Common Failure Cases and Meaning

### 26.1 Frontend Opens but API Calls Fail

Likely causes:

```txt
VITE_API_URL is wrong
Backend is down
CORS_ORIGINS does not include frontend URL
JWT token is expired or invalid
```

Check:

```bash
curl https://backend-production-f6a9.up.railway.app/health
```

Check frontend variable:

```bash
npx @railway/cli variable list --service frontend
```

### 26.2 Backend Health Works but Signup Fails

Likely causes:

```txt
DATABASE_URL is wrong
Postgres service is not running
Tables were not created
Backend cannot connect to database
```

Check backend logs:

```bash
npx @railway/cli logs --service backend
```

Connect to database:

```bash
npx @railway/cli connect Postgres
```

Then:

```sql
\dt
```

### 26.3 Member Cannot See Project

Likely reason:

```txt
Member was not added to project_members table.
```

Check:

```sql
SELECT * FROM project_members;
```

Admin must add the member first.

### 26.4 Admin Cannot Assign Task to Member

Likely reason:

```txt
The selected assignee is not a project member.
```

Backend requires:

```txt
assignee_id exists in project_members for that project_id
```

Check:

```sql
SELECT project_id, user_id FROM project_members;
```

### 26.5 Frontend Railway URL Returns 403

This happened because Vite preview blocks unknown hosts unless allowed.

Fix is in:

```txt
frontend/vite.config.js
```

Config:

```js
preview: {
  allowedHosts: ['.up.railway.app'],
}
```

After changing this, frontend was redeployed.

### 26.6 Local `127.0.0.1:5432` Connection Fails

This means local Postgres credentials are wrong or local Postgres is not running.

It does not mean Railway Postgres is broken.

Railway Postgres is separate from local Postgres.

Use:

```bash
npx @railway/cli connect Postgres
```

to view the live deployed database.

## 27. Exact Live Acceptance Checks That Were Run

### 27.1 Live URLs

Frontend check:

```bash
curl -s -o /dev/null -w '%{http_code}' https://frontend-production-d08f.up.railway.app
```

Result:

```txt
200
```

Backend health:

```bash
curl -s https://backend-production-f6a9.up.railway.app/health
```

Result:

```json
{
  "status": "ok"
}
```

### 27.2 JWT Protection Check

Request without token:

```bash
curl -s -o /tmp/unauth_dashboard.json -w '%{http_code}' \
  https://backend-production-f6a9.up.railway.app/api/dashboard
```

Result:

```txt
401
```

This proves protected APIs require JWT.

### 27.3 Member Blocked from Admin API

Member tried to create project:

```bash
curl -X POST https://backend-production-f6a9.up.railway.app/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <member_token>" \
  -d '{"name":"Should Fail","description":"RBAC check"}'
```

Result:

```txt
403
```

This proves admin-only APIs are blocked for members.

### 27.4 Member Status Update Check

Member updated assigned task:

```bash
curl -X PUT https://backend-production-f6a9.up.railway.app/api/tasks/<task_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <member_token>" \
  -d '{"status":"IN_PROGRESS"}'
```

Result:

```txt
200
```

This proves members can update assigned task status.

### 27.5 Dashboard Check

Admin dashboard response:

```json
{
  "totalTasks": 1,
  "todoTasks": 0,
  "inProgressTasks": 1,
  "doneTasks": 0,
  "overdueTasks": 0,
  "totalProjects": 1
}
```

This proves dashboard task progress and overdue count are working.

## 28. Final Mental Model

Always remember this separation:

```txt
Frontend = user interface
Backend = rules, validation, auth, API
Database = permanent storage
```

The request path is always:

```txt
User action
-> React component
-> Axios request
-> FastAPI route
-> Pydantic schema validation
-> JWT/auth role check
-> SQLAlchemy query/update
-> Railway Postgres
-> Serializer
-> JSON response
-> React state update
-> UI changes
```

No frontend file directly accesses the database.

No database password is sent to the browser.

All real live data is stored in Railway Postgres.

## 29. JWT Secret, Railway, and VITE_API_URL Explained

This section explains three important concepts:

```txt
JWT_SECRET
Railway
VITE_API_URL
```

These are not UI features, but they are required for authentication, deployment, and frontend-backend communication.

### 29.1 What Is JWT

JWT means:

```txt
JSON Web Token
```

In this project, JWT is used for login sessions.

Instead of asking the user to send email/password on every request, the flow is:

```txt
User logs in once
-> backend verifies email/password
-> backend creates JWT token
-> frontend stores token in localStorage
-> frontend sends token with future requests
-> backend verifies token
-> backend knows which user is making the request
```

Example token shape:

```txt
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The token contains encoded user information like:

```json
{
  "id": "user_id",
  "email": "admin@demo.com",
  "role": "ADMIN",
  "exp": 1778228481
}
```

Important:

JWT is encoded and signed. It is not encrypted.

That means:

- The backend can verify whether the token was created by this app.
- Users should not put secrets/passwords inside JWT payload.
- Password is never stored inside the JWT.

### 29.2 What Is `JWT_SECRET`

`JWT_SECRET` is a private string used by the backend to sign and verify JWT tokens.

In this project, it is read from:

```txt
backend/app/config.py
```

Environment variable:

```env
JWT_SECRET=<long_random_secret>
```

Used in:

```txt
backend/app/security.py
```

Concept:

```txt
create_access_token()
-> signs token using JWT_SECRET

decode_token()
-> verifies token using same JWT_SECRET
```

If someone changes the token manually, the signature check fails.

If `JWT_SECRET` changes, old login tokens become invalid.

### 29.3 Where the JWT Secret Came From

For Railway deployment, a random secret was generated locally using:

```bash
openssl rand -hex 32
```

This generated a 64-character hexadecimal string.

Example format:

```txt
e183f5a234124b94a08121dc2c04b1f386c5abe9b6af4906cf34867374f3bdc8
```

This value was then set as Railway backend environment variable:

```bash
npx @railway/cli variable set \
  --service backend \
  JWT_SECRET=<generated_random_secret>
```

Important security point:

```txt
JWT_SECRET should not be committed to GitHub.
```

That is why the README and `.env.example` show placeholder values, not the real production secret.

### 29.4 Why a Random Secret Is Needed

Bad secret:

```env
JWT_SECRET=secret
```

Problem:

```txt
Easy to guess.
Attackers could forge tokens if they know or guess it.
```

Good secret:

```env
JWT_SECRET=<long random value>
```

Reason:

```txt
Hard to guess.
Makes fake token signing practically impossible.
```

### 29.5 Local JWT Secret

For local development, `backend/.env.example` contains:

```env
JWT_SECRET="replace_with_a_long_random_secret"
```

When running locally, create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Then replace:

```env
JWT_SECRET="replace_with_a_long_random_secret"
```

with something like:

```env
JWT_SECRET="local_dev_secret_change_me"
```

For real production, use a strong random secret.

### 29.6 What Is Railway

Railway is a cloud deployment platform.

It lets you deploy:

- Backend servers
- Frontend apps
- Databases
- Environment variables
- Public URLs/domains

For this assignment, Railway is required because the assignment says:

```txt
Deployment (Mandatory)
Deploy using Railway
App must be live and fully functional for selection
```

So Railway is not optional for this submission. It is part of the assignment requirement.

### 29.7 Why Railway Is Used in This Project

Railway is used for three things:

```txt
1. Hosting the FastAPI backend
2. Hosting the React frontend
3. Hosting the PostgreSQL database
```

Without Railway:

```txt
App works only on local machine.
Evaluator cannot open a live URL.
Submission requirement is not met.
```

With Railway:

```txt
Frontend has public URL
Backend has public URL
Database is hosted online
Evaluator can test app from browser
```

### 29.8 What Railway Is Doing Internally

For backend:

```txt
Railway receives backend folder
-> installs Python dependencies from requirements.txt
-> starts FastAPI using Procfile
-> injects env vars like DATABASE_URL and JWT_SECRET
-> exposes public backend URL
```

For frontend:

```txt
Railway receives frontend folder
-> installs npm dependencies
-> builds React/Vite app
-> starts Vite preview server
-> injects VITE_API_URL during build
-> exposes public frontend URL
```

For database:

```txt
Railway creates PostgreSQL server
-> creates database credentials
-> exposes DATABASE_URL to backend service
-> stores real app data
```

### 29.9 What Railway Services Exist Here

Current Railway project:

```txt
team-task-manager
```

Services:

```txt
Postgres
backend
frontend
```

`Postgres`:

```txt
Stores users, projects, project_members, tasks.
```

`backend`:

```txt
Runs FastAPI APIs and connects to Postgres.
```

`frontend`:

```txt
Runs React UI and calls backend APIs.
```

### 29.10 What Is an Environment Variable

An environment variable is a configuration value stored outside the source code.

Examples:

```env
DATABASE_URL=...
JWT_SECRET=...
CORS_ORIGINS=...
VITE_API_URL=...
```

Why use environment variables:

- Different values for local and production.
- Secrets are not committed to GitHub.
- Deployment config can change without editing code.

### 29.11 Backend Environment Variables

Backend uses:

```env
DATABASE_URL
JWT_SECRET
CORS_ORIGINS
PORT
```

`DATABASE_URL`:

```txt
Tells SQLAlchemy where the database is.
```

`JWT_SECRET`:

```txt
Signs/verifies login tokens.
```

`CORS_ORIGINS`:

```txt
Allows browser requests from the frontend URL.
```

`PORT`:

```txt
Railway tells the backend which port to listen on.
```

### 29.12 Frontend Environment Variables

Frontend uses:

```env
VITE_API_URL
```

Only variables starting with:

```txt
VITE_
```

are exposed to Vite frontend code.

That is why the variable is named:

```txt
VITE_API_URL
```

and not:

```txt
API_URL
```

### 29.13 What Is `VITE_API_URL=http://localhost:8000/api`

This is the local backend API base URL used by the frontend during local development.

In `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:8000/api
```

Meaning:

```txt
When frontend runs locally at http://localhost:5173,
send API requests to backend running locally at http://localhost:8000/api.
```

Example:

Frontend code:

```js
api.post('/auth/login', credentials)
```

With local `VITE_API_URL`:

```txt
http://localhost:8000/api/auth/login
```

Frontend code:

```js
api.get('/projects')
```

With local `VITE_API_URL`:

```txt
http://localhost:8000/api/projects
```

### 29.14 Why `/api` Is Included in VITE_API_URL

Backend routes are prefixed with `/api`.

Examples:

```txt
/api/auth/login
/api/projects
/api/tasks
/api/dashboard
```

If `VITE_API_URL` was only:

```env
VITE_API_URL=http://localhost:8000
```

then this frontend call:

```js
api.get('/projects')
```

would go to:

```txt
http://localhost:8000/projects
```

That route does not exist.

Correct:

```env
VITE_API_URL=http://localhost:8000/api
```

Then:

```js
api.get('/projects')
```

becomes:

```txt
http://localhost:8000/api/projects
```

### 29.15 Live Production VITE_API_URL

In Railway frontend service, production value is:

```env
VITE_API_URL=https://backend-production-f6a9.up.railway.app/api
```

Meaning:

```txt
When user opens live frontend,
frontend sends API calls to live backend.
```

Example:

```js
api.get('/dashboard')
```

becomes:

```txt
https://backend-production-f6a9.up.railway.app/api/dashboard
```

### 29.16 Where VITE_API_URL Is Used in Code

File:

```txt
frontend/src/api/axios.js
```

Code:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})
```

Meaning:

```txt
Use VITE_API_URL if available.
Otherwise fallback to http://localhost:8000/api.
```

This protects local development if `.env` is missing.

### 29.17 VITE_API_URL Is Not Secret

`VITE_API_URL` is visible in browser JavaScript.

That is okay because:

```txt
Backend API URL is public.
```

Secrets should not be put in Vite frontend variables.

Never put these in frontend `.env`:

```txt
JWT_SECRET
DATABASE_URL
PGPASSWORD
```

Those must stay only on backend/Railway server side.

### 29.18 Difference Between Local and Live Environment Values

Local frontend:

```env
VITE_API_URL=http://localhost:8000/api
```

Live frontend:

```env
VITE_API_URL=https://backend-production-f6a9.up.railway.app/api
```

Local backend:

```env
DATABASE_URL=sqlite:///./team_task_manager.db
JWT_SECRET=local_dev_secret
CORS_ORIGINS=http://localhost:5173
```

Live backend:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<strong_random_secret>
CORS_ORIGINS=https://frontend-production-d08f.up.railway.app
```

### 29.19 What Happens If VITE_API_URL Is Wrong

Wrong example:

```env
VITE_API_URL=http://localhost:8000/api
```

used in production frontend.

Problem:

```txt
The deployed frontend tries to call localhost.
But localhost means the user's own computer, not Railway backend.
API calls fail.
```

Wrong example:

```env
VITE_API_URL=https://backend-production-f6a9.up.railway.app
```

Problem:

```txt
Missing /api.
Frontend calls /projects instead of /api/projects.
Backend returns 404.
```

Correct production value:

```env
VITE_API_URL=https://backend-production-f6a9.up.railway.app/api
```

### 29.20 What Happens If JWT_SECRET Is Wrong

If `JWT_SECRET` changes:

```txt
Existing tokens fail verification.
Users must log in again.
```

If `JWT_SECRET` is missing:

```txt
Backend may use fallback from config.
This is bad for production because fallback is predictable.
```

Production should always set:

```env
JWT_SECRET=<long random secret>
```

### 29.21 What Happens If DATABASE_URL Is Wrong

If `DATABASE_URL` is wrong:

```txt
Backend cannot connect to database.
Signup/login/project/task APIs fail.
```

Typical backend log errors:

```txt
connection refused
password authentication failed
database does not exist
could not translate host name
```

Check backend logs:

```bash
npx @railway/cli logs --service backend
```

### 29.22 Why Backend Has CORS_ORIGINS

Browsers enforce CORS.

The frontend URL:

```txt
https://frontend-production-d08f.up.railway.app
```

is different from backend URL:

```txt
https://backend-production-f6a9.up.railway.app
```

So browser asks:

```txt
Is this frontend allowed to call this backend?
```

Backend answers using CORS middleware.

Allowed origin is configured by:

```env
CORS_ORIGINS=https://frontend-production-d08f.up.railway.app
```

If this is wrong, browser blocks frontend API calls even if backend works in curl.

### 29.23 Complete Config Flow Summary

Local development:

```txt
frontend .env
VITE_API_URL=http://localhost:8000/api

backend .env
DATABASE_URL=sqlite:///./team_task_manager.db
JWT_SECRET=local_secret
CORS_ORIGINS=http://localhost:5173
```

Production Railway:

```txt
frontend Railway variable
VITE_API_URL=https://backend-production-f6a9.up.railway.app/api

backend Railway variables
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generated random secret>
CORS_ORIGINS=https://frontend-production-d08f.up.railway.app
```

Runtime result:

```txt
User opens frontend
-> frontend reads built API URL
-> calls backend
-> backend validates JWT with JWT_SECRET
-> backend connects to Postgres with DATABASE_URL
-> backend returns JSON
```

## 30. Important Things You Should Know Before Submission or Interview

This section contains the practical knowledge you should be ready to explain if someone asks about this project.

### 30.1 One-Line Project Explanation

Say:

```txt
This is a full-stack Team Task Manager where Admin users can manage projects, members, and tasks, while Member users can view assigned projects/tasks and update only their task status.
```

### 30.2 One-Line Architecture Explanation

Say:

```txt
The React frontend talks to a FastAPI backend through REST APIs, and the backend uses SQLAlchemy to store data in Railway PostgreSQL.
```

### 30.3 One-Line Deployment Explanation

Say:

```txt
The frontend, backend, and PostgreSQL database are deployed as separate Railway services, and the frontend calls the backend using the deployed API URL.
```

### 30.4 Why This Is Not Overengineered

This project has only the required core modules:

```txt
auth
projects
project members
tasks
dashboard
role checks
database models
deployment config
```

It does not include unnecessary features like:

```txt
payments
notifications
chat
file uploads
real-time sockets
complex permissions
microservices
```

So it is suitable for a 1-2 day assignment.

### 30.5 What Happens When User Signs Up

Simple explanation:

```txt
The frontend sends name, email, password, and role to the backend.
The backend validates the data, checks duplicate email, hashes the password, stores the user, creates a JWT token, and returns the token to the frontend.
```

Files involved:

```txt
Signup.jsx
AuthContext.jsx
axios.js
auth.py
schemas.py
security.py
models.py
serializers.py
```

Database table:

```txt
users
```

### 30.6 What Happens When User Logs In

Simple explanation:

```txt
The frontend sends email and password.
The backend finds the user, compares the password with the stored hash, and returns a JWT token if credentials are correct.
```

Important:

```txt
The backend never compares plain text stored password because plain password is never stored.
```

### 30.7 What Is Stored in Local Storage

Only this is stored:

```txt
token
```

The frontend does not store:

```txt
password
database credentials
JWT secret
Postgres URL
```

### 30.8 How JWT Protection Works

Protected request:

```txt
GET /api/tasks
Authorization: Bearer <token>
```

Backend:

```txt
reads token
decodes token
verifies signature using JWT_SECRET
loads user from database
allows route if user exists
```

If token is missing:

```txt
401 Unauthorized
```

If role is not allowed:

```txt
403 Forbidden
```

### 30.9 Difference Between 401 and 403

`401 Unauthorized`:

```txt
User is not authenticated.
Token missing or invalid.
```

Example:

```txt
Calling /api/dashboard without token.
```

`403 Forbidden`:

```txt
User is authenticated but does not have permission.
```

Example:

```txt
Member trying to create a project.
```

### 30.10 Admin vs Member Difference

Admin:

```txt
Can create projects.
Can edit/delete projects.
Can add members.
Can create/assign/delete tasks.
Can update any task.
Can see all dashboard data.
```

Member:

```txt
Can see assigned projects.
Can see assigned tasks.
Can update only assigned task status.
Cannot create projects.
Cannot create tasks.
Cannot delete projects/tasks.
Cannot change task title/assignee/project/priority/due date.
```

### 30.11 Why Project Members Table Exists

A project can have many users.

A user can belong to many projects.

This is a many-to-many relationship.

So we need a join table:

```txt
project_members
```

Without this table, the app would not know:

```txt
which member belongs to which project
```

### 30.12 Why Assignee Must Be Project Member

This rule prevents invalid task assignment.

Bad case:

```txt
Assigning a task to a user who is not part of the project.
```

Backend prevents this by checking:

```txt
project_members contains project_id + assignee_id
```

If not found:

```json
{
  "detail": "Assignee must be a member of the project"
}
```

### 30.13 Why Dashboard Is Role-Based

Admin dashboard:

```txt
shows all tasks and all projects
```

Member dashboard:

```txt
shows only assigned tasks and member projects
```

Reason:

```txt
Member should not see full company/team data.
```

### 30.14 How Overdue Count Works

Backend counts overdue tasks where:

```txt
due_date < current time
and status != DONE
```

Meaning:

```txt
A task is overdue only if its due date passed and it is still not completed.
```

If task is `DONE`, it is not counted as overdue even if date is old.

### 30.15 Why Backend Uses Serializers

Database fields use Python/database naming:

```txt
created_at
project_id
due_date
```

Frontend expects JavaScript-style names:

```txt
createdAt
projectId
dueDate
```

`serializers.py` converts database models into frontend-friendly JSON.

### 30.16 Why Pydantic Schemas Are Used

Schemas validate incoming request bodies.

Example:

```txt
password must have minimum length
email must be valid email
task title cannot be missing
status must be TODO, IN_PROGRESS, or DONE
```

Without schemas:

```txt
invalid data could reach database logic
```

### 30.17 Why SQLAlchemy Is Used

SQLAlchemy is the ORM.

ORM means:

```txt
Object Relational Mapper
```

It lets backend code work with Python classes:

```py
User
Project
Task
```

instead of writing raw SQL everywhere.

Example:

```py
db.query(User).filter(User.email == email).first()
```

### 30.18 Why PostgreSQL Is Used

PostgreSQL is a relational database.

It is good for this project because:

```txt
users, projects, project members, and tasks have clear relationships
```

Examples:

```txt
Project belongs to User
Task belongs to Project
Task assigned to User
Project has many Members
```

### 30.19 Why SQLite Fallback Exists

Local development can run without installing Postgres.

If `DATABASE_URL` is missing:

```txt
sqlite:///./team_task_manager.db
```

is used.

This makes quick testing easier.

Production uses Railway PostgreSQL.

### 30.20 Why CORS Is Needed

Frontend URL:

```txt
https://frontend-production-d08f.up.railway.app
```

Backend URL:

```txt
https://backend-production-f6a9.up.railway.app
```

Because they are different origins, browser needs backend permission.

Backend allows frontend through:

```txt
CORS_ORIGINS
```

If CORS is wrong:

```txt
curl may work but browser API calls fail
```

### 30.21 Why Backend Root Shows Not Found

Backend root:

```txt
https://backend-production-f6a9.up.railway.app
```

returns:

```json
{"detail":"Not Found"}
```

This is expected because no `/` route was created.

Correct backend test route:

```txt
/health
```

Correct frontend route:

```txt
https://frontend-production-d08f.up.railway.app
```

### 30.22 What You Should Say If Asked About Database Visualization

Say:

```txt
The deployed database is Railway Postgres, not my local 127.0.0.1 database.

I can inspect it using Railway CLI with npx @railway/cli connect Postgres, then run SQL queries against users, projects, project_members, and tasks.
```

### 30.23 What You Should Say If Asked About Security

Say:

```txt
Passwords are hashed with bcrypt before storing.
JWT tokens are signed with a server-side JWT_SECRET.
Protected APIs require Authorization Bearer token.
Admin-only routes use role checks.
Database credentials and JWT secret are stored in Railway environment variables, not frontend code.
```

### 30.24 What You Should Say If Asked About Validations

Say:

```txt
Pydantic validates request payloads, SQLAlchemy relationships enforce data structure, duplicate emails are blocked, duplicate project membership is blocked, and task assignment is allowed only when the assignee is already a project member.
```

### 30.25 What You Should Say If Asked About Limitations

Be honest.

Say:

```txt
This assignment version focuses on core task management requirements. It does not include email verification, password reset, file uploads, advanced team roles, comments, notifications, or real-time updates.
```

Then add:

```txt
Those could be added later, but I kept this version focused on the required 1-2 day assignment scope.
```

### 30.26 What You Should Say If Asked About Future Improvements

Possible improvements:

```txt
Add password reset.
Add email verification.
Add comments on tasks.
Add activity logs.
Add due date reminders.
Add project-level roles.
Add pagination and search.
Add automated tests.
Add migrations with Alembic.
```

Good answer:

```txt
The first improvement I would add is database migrations with Alembic and automated backend tests, because those improve long-term maintainability.
```

### 30.27 Why No Alembic Migrations

Current project uses:

```py
Base.metadata.create_all(bind=engine)
```

This is simple and acceptable for an assignment/demo.

For production-scale apps, use:

```txt
Alembic migrations
```

Reason:

```txt
Migrations track database schema changes over time.
```

### 30.28 Why No Refresh Token

Current project uses one JWT access token with expiry.

This is enough for assignment scope.

Production improvement:

```txt
access token + refresh token
```

Reason:

```txt
Better session management and token rotation.
```

### 30.29 Why Role Can Be Selected During Signup

For this assignment/demo, signup allows choosing:

```txt
ADMIN
MEMBER
```

Reason:

```txt
It makes demo testing simple because evaluator can create both role types quickly.
```

Production improvement:

```txt
Only existing admins should be able to promote users or invite admins.
```

### 30.30 What Data Should Exist for Demo

Minimum demo data:

```txt
One Admin user
One Member user
One Project
One ProjectMember relationship
One Task assigned to Member
```

With this data, you can show:

```txt
Admin project management
Admin member assignment
Admin task assignment
Member restricted view
Member status update
Dashboard counts
Database relationships
```

### 30.31 How to Explain the Full Data Relationship

Say:

```txt
The Admin user owns a project. The Member user is added to that project through the project_members table. Then a task is created under that project and assigned to the Member. The task also stores created_by_id so we know which Admin created it.
```

Relationship chain:

```txt
users.id
-> projects.owner_id

projects.id + users.id
-> project_members.project_id + project_members.user_id

projects.id
-> tasks.project_id

users.id
-> tasks.assignee_id

users.id
-> tasks.created_by_id
```

### 30.32 How to Explain Frontend State Update

Say:

```txt
After creating or updating data, the frontend reloads the affected list from the backend, so the UI always shows the latest database state.
```

Example:

```txt
After creating a task, Tasks.jsx calls loadData() again to fetch latest tasks and projects.
```

### 30.33 How to Explain Why Members Only See Their Own Tasks

Backend query for member tasks filters by:

```txt
Task.assignee_id == current_user.id
```

So even if a Member tries to call the API manually, backend still returns only assigned tasks.

This is important because:

```txt
security is enforced on backend, not only frontend buttons
```

### 30.34 How to Explain Why Members Only Update Status

Backend checks the keys sent in update payload.

For Member:

```txt
allowed payload keys = {"status"}
```

If Member sends:

```json
{
  "title": "Changed title",
  "status": "DONE"
}
```

Backend rejects it.

This proves:

```txt
role-based restrictions are enforced by API logic
```

### 30.35 What to Check Before Final Submission

Final must-have items:

```txt
Live frontend URL
GitHub repo URL
README
Demo video
Demo credentials
```

Technical status:

```txt
Frontend live: done
Backend live: done
Railway Postgres: done
README: mostly done
GitHub URL: still needs to be added after push
Demo video: still needs recording
```

### 30.36 Short Answers to Common Questions

Question:

```txt
Why FastAPI?
```

Answer:

```txt
FastAPI gives fast REST API development, automatic validation with Pydantic, clean dependency injection, and good support for Python backend projects.
```

Question:

```txt
Why SQL database?
```

Answer:

```txt
The app has relational data: users, projects, members, and tasks. PostgreSQL handles these relationships well.
```

Question:

```txt
Where is RBAC implemented?
```

Answer:

```txt
RBAC is implemented in backend dependencies and route logic. Admin-only routes use require_admin, and member-specific restrictions are checked in task and project queries.
```

Question:

```txt
What protects the APIs?
```

Answer:

```txt
JWT Bearer authentication protects APIs. The backend decodes the token, loads the current user, and checks role permissions.
```

Question:

```txt
How does frontend know user role?
```

Answer:

```txt
After login, backend returns user data with role. AuthContext stores the user and exposes isAdmin to components.
```

Question:

```txt
Can Members bypass frontend restrictions?
```

Answer:

```txt
No. Even if they manually call APIs, backend checks JWT role and ownership/assignment rules.
```

Question:

```txt
Where is the database hosted?
```

Answer:

```txt
The live database is Railway PostgreSQL.
```

Question:

```txt
What does VITE_API_URL do?
```

Answer:

```txt
It tells the React frontend which backend API base URL to call.
```

Question:

```txt
What does DATABASE_URL do?
```

Answer:

```txt
It tells the backend how to connect to PostgreSQL.
```

Question:

```txt
What does JWT_SECRET do?
```

Answer:

```txt
It signs and verifies JWT tokens so the backend can trust authenticated requests.
```

### 30.37 Most Important Concept

The most important concept is:

```txt
Frontend hides or shows buttons for user experience,
but backend enforces the real security.
```

Meaning:

```txt
Even if a Member tries to call an Admin API manually,
the backend blocks the request with 403.
```

This is what makes RBAC correct.
