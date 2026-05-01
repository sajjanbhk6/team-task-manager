# Team Task Manager - Project Description

## Assignment

This project is built for the **Team Task Manager full-stack assignment**.

The goal was to build a web application where users can create projects, assign tasks, and track task progress with role-based access for `Admin` and `Member` users.

## Live Deployment

Frontend live URL:

```txt
https://frontend-production-d08f.up.railway.app
```

Backend API URL:

```txt
https://backend-production-f6a9.up.railway.app
```

Backend health check:

```txt
https://backend-production-f6a9.up.railway.app/health
```

## Demo Credentials

Admin:

```txt
Email: admin@demo.com
Password: password123
```

Member:

```txt
Email: member@demo.com
Password: password123
```

## Tech Stack

Frontend:

- React
- Vite
- Tailwind CSS
- React Router
- Axios

Backend:

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT authentication
- passlib bcrypt password hashing

Database:

- PostgreSQL on Railway
- SQLite fallback for local testing

Deployment:

- Railway frontend service
- Railway backend service
- Railway PostgreSQL service

## Implemented Features

### Authentication

The app includes signup and login functionality.

Users can create an account with:

- Name
- Email
- Password
- Role: `ADMIN` or `MEMBER`

Passwords are hashed before storing in the database.

After login/signup, the backend returns a JWT token. The frontend stores this token and sends it with protected API requests.

### Role-Based Access Control

The app supports two roles:

```txt
ADMIN
MEMBER
```

Admin users can:

- Create projects
- Edit projects
- Delete projects
- Add members to projects
- Create tasks
- Assign tasks to project members
- Update any task
- Delete tasks
- View all dashboard data

Member users can:

- View only assigned projects
- View only assigned tasks
- Update only the status of assigned tasks
- View personal dashboard data

Member users cannot:

- Create projects
- Edit projects
- Delete projects
- Add project members
- Create tasks
- Delete tasks
- Update task title, description, assignee, project, priority, or due date

Admin-only APIs are protected on the backend, not just hidden in the frontend UI.

### Project and Team Management

Admins can create and manage projects.

Each project has:

- Name
- Description
- Owner
- Members
- Tasks

Admins can add members to a project by email.

The relationship between projects and members is stored in a dedicated `project_members` table.

### Task Management

Admins can create and assign tasks.

Each task includes:

- Title
- Description
- Status
- Priority
- Due date
- Project
- Assignee
- Created by

Allowed task statuses:

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

A task can only be assigned to a user who is already a member of the selected project.

### Dashboard

The dashboard shows:

- Total tasks
- Todo tasks
- In-progress tasks
- Completed tasks
- Overdue tasks
- Total projects

For Admin users, dashboard counts are based on all projects and tasks.

For Member users, dashboard counts are based only on assigned tasks and assigned projects.

Overdue tasks are calculated as:

```txt
due date is before current time
and task status is not DONE
```

## Database Design

The application uses a relational PostgreSQL database.

Main tables:

```txt
users
projects
project_members
tasks
```

Relationships:

- One user can own many projects.
- One project can have many members.
- One user can belong to many projects.
- One project can have many tasks.
- One task belongs to one project.
- One task is assigned to one user.
- One task is created by one admin user.

Important constraints:

- User email must be unique.
- A user cannot be added to the same project twice.
- A task assignee must be a member of the selected project.

## REST API Coverage

The backend exposes REST APIs for:

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

Protected APIs require:

```http
Authorization: Bearer <jwt_token>
```

## Validations

The project includes validation at multiple levels:

- Pydantic request validation
- Email validation
- Password minimum length
- Required project name
- Required task title
- Enum validation for role, task status, and priority
- Duplicate email prevention
- Duplicate project member prevention
- Assignee must be a member of the selected project
- Member users can update only task status

## Deployment

The application is deployed on Railway as required by the assignment.

Railway services:

```txt
Postgres
backend
frontend
```

The backend uses Railway PostgreSQL through the `DATABASE_URL` environment variable.

The frontend uses:

```env
VITE_API_URL=https://backend-production-f6a9.up.railway.app/api
```

to communicate with the deployed backend.

## Verification Status

The following checks have been verified:

- Live frontend opens successfully
- Backend health endpoint returns `{"status":"ok"}`
- Admin login works
- Member login works
- Admin can create projects
- Admin can add members to projects
- Admin can create and assign tasks
- Member can view assigned projects
- Member can view assigned tasks
- Member can update assigned task status
- Member is blocked from Admin-only APIs
- APIs require JWT authentication
- Dashboard returns task progress and overdue count
- Frontend production build passes
- Frontend lint passes
- Backend Python compile check passes

## Notes

The backend root URL returns:

```json
{"detail":"Not Found"}
```

This is expected because the backend is an API service and does not have a homepage route.

The correct backend test endpoint is:

```txt
/health
```

## Submission Items

Completed:

- Live frontend URL
- Live backend URL
- README with setup, APIs, roles, and deployment details
- Railway deployment
- Demo credentials

Pending:

- GitHub repository URL
- Demo video URL

These should be added to the README after pushing the source code and recording the demo video.
