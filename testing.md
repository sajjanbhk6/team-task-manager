# Team Task Manager - Complete Testing Guide

This guide explains how to test the project from zero knowledge to full end-to-end verification.

It covers:

- Live deployed app testing
- Frontend UI testing
- Backend API testing
- JWT authentication testing
- Admin/Member role testing
- Database testing
- Railway deployment testing
- Local development testing
- Final acceptance checklist

## 1. Important URLs and Credentials

Live frontend app:

```txt
https://frontend-production-d08f.up.railway.app
```

Live backend:

```txt
https://backend-production-f6a9.up.railway.app
```

Live backend health:

```txt
https://backend-production-f6a9.up.railway.app/health
```

Live API base:

```txt
https://backend-production-f6a9.up.railway.app/api
```

Demo Admin:

```txt
Email: admin@demo.com
Password: password123
```

Demo Member:

```txt
Email: member@demo.com
Password: password123
```

## 2. Testing Order

Follow this order:

1. Check deployed frontend opens.
2. Check deployed backend health endpoint.
3. Test signup/login from browser.
4. Test Admin project flow.
5. Test Admin member flow.
6. Test Admin task flow.
7. Test Member project/task flow.
8. Test dashboard.
9. Test backend APIs with curl.
10. Test JWT protection.
11. Test role-based access blocking.
12. Test database storage.
13. Test local development setup.

## 3. Basic Live App Test

### 3.1 Open Frontend

Open in browser:

```txt
https://frontend-production-d08f.up.railway.app
```

Expected:

```txt
Login or signup page opens.
```

If page opens:

```txt
Frontend deployment is working.
```

If page does not open:

Check Railway frontend service logs.

### 3.2 Open Backend Health

Open in browser:

```txt
https://backend-production-f6a9.up.railway.app/health
```

Expected:

```json
{
  "status": "ok"
}
```

If this appears:

```txt
Backend deployment is working.
```

### 3.3 Backend Root Test

Open:

```txt
https://backend-production-f6a9.up.railway.app
```

Expected:

```json
{
  "detail": "Not Found"
}
```

This is not an error. The backend is an API server, not a website homepage.

## 4. Browser UI Testing

## 4.1 Signup Test

Open frontend:

```txt
https://frontend-production-d08f.up.railway.app
```

Click:

```txt
Sign up
```

Create an Admin test user:

```txt
Name: Test Admin
Email: testadmin1@example.com
Password: password123
Role: ADMIN
```

Expected:

```txt
User is created.
User is redirected to dashboard.
Dashboard page appears.
```

Create a Member test user:

Logout first.

Then sign up:

```txt
Name: Test Member
Email: testmember1@example.com
Password: password123
Role: MEMBER
```

Expected:

```txt
Member account is created.
Member is redirected to dashboard.
```

Important:

If you use the same email twice, signup should fail because email must be unique.

Expected duplicate email error:

```txt
Email is already registered
```

## 4.2 Login Test

Open frontend:

```txt
https://frontend-production-d08f.up.railway.app
```

Log in as Admin:

```txt
Email: admin@demo.com
Password: password123
```

Expected:

```txt
Dashboard opens.
Navbar shows user session.
Projects and Tasks navigation are available.
```

Logout.

Log in as Member:

```txt
Email: member@demo.com
Password: password123
```

Expected:

```txt
Dashboard opens.
Member can see assigned data only.
```

Invalid login test:

```txt
Email: admin@demo.com
Password: wrongpassword
```

Expected:

```txt
Invalid email or password
```

## 4.3 Admin Project Creation Test

Login as Admin.

Go to:

```txt
Projects
```

Click:

```txt
Create project
```

Enter:

```txt
Name: QA Project
Description: Project created during testing
```

Submit.

Expected:

```txt
Project appears in project list.
Project card shows project name.
Project card shows member count.
Details button is visible.
Delete button is visible for Admin.
```

## 4.4 Admin Project Edit Test

From Projects page, click:

```txt
Details
```

Click:

```txt
Edit project
```

Change:

```txt
Name: QA Project Updated
Description: Updated during testing
```

Submit.

Expected:

```txt
Project name and description update.
Success message appears.
```

## 4.5 Admin Add Member Test

Login as Admin.

Open a project detail page.

In Add member form, enter:

```txt
member@demo.com
```

Submit.

Expected:

```txt
Member appears in Members list.
Member name/email/role are visible.
```

If member is already added:

Expected:

```txt
User is already a project member
```

## 4.6 Admin Create Task Test

Login as Admin.

Go to:

```txt
Tasks
```

Click:

```txt
Create task
```

Enter:

```txt
Title: QA Task
Description: Task created during testing
Project: select QA Project
Assignee: select Demo Member or Test Member
Status: TODO
Priority: HIGH
Due date: choose tomorrow or any future date
```

Submit.

Expected:

```txt
Task appears in task list.
Task shows title, description, project, assignee, priority, due date, and status.
```

Important:

The assignee dropdown only shows project members. If no members appear, add a member to the project first.

## 4.7 Admin Task Status Update Test

Login as Admin.

Go to:

```txt
Tasks
```

Find a task.

Change status dropdown:

```txt
TODO -> IN_PROGRESS
```

Expected:

```txt
Task status updates.
Dashboard in-progress count changes.
```

Change status:

```txt
IN_PROGRESS -> DONE
```

Expected:

```txt
Task status updates to DONE.
Dashboard completed count changes.
```

## 4.8 Admin Delete Task Test

Login as Admin.

Go to:

```txt
Tasks
```

Click:

```txt
Delete
```

Expected:

```txt
Task disappears from list.
```

Only Admin should see Delete button.

## 4.9 Member Assigned Project Test

Login as Member:

```txt
member@demo.com
password123
```

Go to:

```txt
Projects
```

Expected:

```txt
Member sees only projects where they were added as a member.
Member does not see Create project button.
Member does not see Delete project button.
```

## 4.10 Member Assigned Task Test

Login as Member.

Go to:

```txt
Tasks
```

Expected:

```txt
Member sees only tasks assigned to them.
Member does not see Create task button.
Member does not see Delete task button.
Member can change status dropdown.
```

Change status:

```txt
TODO -> IN_PROGRESS
```

Expected:

```txt
Status updates successfully.
```

## 4.11 Dashboard Test

Login as Admin.

Open:

```txt
Dashboard
```

Expected cards:

```txt
Total Tasks
Todo Tasks
In Progress
Completed
Overdue
Total Projects
```

Admin dashboard should show all project/task activity.

Login as Member.

Open:

```txt
Dashboard
```

Expected:

```txt
Member dashboard shows only assigned projects/tasks.
```

## 5. API Testing With Curl

Use terminal.

Set API base:

```bash
API="https://backend-production-f6a9.up.railway.app/api"
```

## 5.1 Health Check

```bash
curl https://backend-production-f6a9.up.railway.app/health
```

Expected:

```json
{"status":"ok"}
```

## 5.2 Login Admin

```bash
curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "password123"
  }'
```

Expected response contains:

```json
{
  "user": {
    "email": "admin@demo.com",
    "role": "ADMIN"
  },
  "token": "jwt_token_here"
}
```

Copy token:

```bash
ADMIN_TOKEN="paste_token_here"
```

## 5.3 Login Member

```bash
curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@demo.com",
    "password": "password123"
  }'
```

Copy token:

```bash
MEMBER_TOKEN="paste_token_here"
```

## 5.4 Test Current User

Admin:

```bash
curl "$API/auth/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected:

```json
{
  "user": {
    "email": "admin@demo.com",
    "role": "ADMIN"
  }
}
```

Member:

```bash
curl "$API/auth/me" \
  -H "Authorization: Bearer $MEMBER_TOKEN"
```

Expected:

```json
{
  "user": {
    "email": "member@demo.com",
    "role": "MEMBER"
  }
}
```

## 5.5 Test JWT Protection

Call dashboard without token:

```bash
curl -i "$API/dashboard"
```

Expected:

```txt
HTTP/2 401
```

Expected body:

```json
{
  "detail": "Authentication token is required"
}
```

## 5.6 Admin Create Project API Test

```bash
curl -s -X POST "$API/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "API Test Project",
    "description": "Created from curl"
  }'
```

Expected:

```json
{
  "project": {
    "id": "project_id",
    "name": "API Test Project"
  }
}
```

Copy:

```bash
PROJECT_ID="paste_project_id_here"
```

## 5.7 Member Blocked From Creating Project

```bash
curl -i -X POST "$API/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{
    "name": "Should Fail",
    "description": "Member should not create this"
  }'
```

Expected:

```txt
HTTP/2 403
```

Expected:

```json
{
  "detail": "You do not have permission to perform this action"
}
```

## 5.8 Add Member to Project

```bash
curl -s -X POST "$API/projects/$PROJECT_ID/members" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "member@demo.com"
  }'
```

Expected:

```json
{
  "member": {
    "projectId": "project_id",
    "user": {
      "email": "member@demo.com"
    }
  }
}
```

## 5.9 Get Member Projects

```bash
curl "$API/projects" \
  -H "Authorization: Bearer $MEMBER_TOKEN"
```

Expected:

```txt
Only projects where member was added.
```

## 5.10 Create Task as Admin

First, get member user ID from add-member response or users table.

Payload:

```bash
curl -s -X POST "$API/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "API Test Task",
    "description": "Created from curl",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": null,
    "projectId": "paste_project_id_here",
    "assigneeId": "paste_member_user_id_here"
  }'
```

Expected:

```json
{
  "task": {
    "id": "task_id",
    "title": "API Test Task",
    "status": "TODO",
    "priority": "HIGH"
  }
}
```

Copy:

```bash
TASK_ID="paste_task_id_here"
```

## 5.11 Member Gets Assigned Tasks

```bash
curl "$API/tasks" \
  -H "Authorization: Bearer $MEMBER_TOKEN"
```

Expected:

```txt
Only tasks assigned to this member.
```

## 5.12 Member Updates Task Status

```bash
curl -i -X PUT "$API/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

Expected:

```txt
HTTP/2 200
```

Expected task:

```json
{
  "task": {
    "status": "IN_PROGRESS"
  }
}
```

## 5.13 Member Cannot Update Title

```bash
curl -i -X PUT "$API/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{
    "title": "Member should not change title",
    "status": "DONE"
  }'
```

Expected:

```txt
HTTP/2 403
```

Expected:

```json
{
  "detail": "Members can update only task status"
}
```

## 5.14 Dashboard API Test

Admin:

```bash
curl "$API/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected:

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

Exact numbers can be different depending on how much test data exists.

Member:

```bash
curl "$API/dashboard" \
  -H "Authorization: Bearer $MEMBER_TOKEN"
```

Expected:

```txt
Counts only assigned tasks and member projects.
```

## 6. Database Testing

The deployed app uses Railway Postgres.

Do not confuse it with local `127.0.0.1:5432`.

## 6.1 Connect to Railway Postgres

Run:

```bash
npx @railway/cli connect Postgres
```

Expected:

```txt
psql shell opens.
```

## 6.2 List Tables

Inside psql:

```sql
\dt
```

Expected tables:

```txt
users
projects
project_members
tasks
```

## 6.3 Check Users

```sql
SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC;
```

Expected:

```txt
Admin and Member users appear.
```

## 6.4 Check Projects

```sql
SELECT id, name, description, owner_id, created_at FROM projects ORDER BY created_at DESC;
```

Expected:

```txt
Created projects appear.
owner_id points to admin user id.
```

## 6.5 Check Project Members

```sql
SELECT id, project_id, user_id, created_at FROM project_members ORDER BY created_at DESC;
```

Expected:

```txt
Rows appear after Admin adds members to projects.
```

Better joined query:

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

## 6.6 Check Tasks

```sql
SELECT id, title, status, priority, project_id, assignee_id, created_by_id, due_date, created_at
FROM tasks
ORDER BY created_at DESC;
```

Expected:

```txt
Rows appear after Admin creates tasks.
assignee_id points to assigned member.
created_by_id points to admin.
project_id points to project.
```

Better joined query:

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

## 6.7 Check Dashboard Counts From DB

```sql
SELECT
  COUNT(*) AS total_tasks,
  COUNT(*) FILTER (WHERE status = 'TODO') AS todo_tasks,
  COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress_tasks,
  COUNT(*) FILTER (WHERE status = 'DONE') AS done_tasks,
  COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'DONE') AS overdue_tasks
FROM tasks;
```

Compare this with:

```bash
curl "$API/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 7. Local Development Testing

Use this only if you want to test the app locally.

## 7.1 Backend Local Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Expected:

```txt
Backend runs at http://localhost:8000
```

Test:

```bash
curl http://localhost:8000/health
```

Expected:

```json
{"status":"ok"}
```

## 7.2 Frontend Local Setup

Open another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Expected:

```txt
Frontend runs at http://localhost:5173
```

Open:

```txt
http://localhost:5173
```

## 7.3 Local Env Check

Frontend `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Backend `.env`:

```env
DATABASE_URL="sqlite:///./team_task_manager.db"
JWT_SECRET="replace_with_a_long_random_secret"
CORS_ORIGINS="http://localhost:5173"
PORT=8000
```

Meaning:

```txt
Local frontend calls local backend.
Local backend uses local SQLite database unless changed.
```

## 8. Validation Testing

## 8.1 Signup Missing Email

```bash
curl -i -X POST "$API/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No Email",
    "password": "password123",
    "role": "MEMBER"
  }'
```

Expected:

```txt
422 Unprocessable Entity
```

## 8.2 Signup Short Password

```bash
curl -i -X POST "$API/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Short Password",
    "email": "shortpass@example.com",
    "password": "123",
    "role": "MEMBER"
  }'
```

Expected:

```txt
422 Unprocessable Entity
```

## 8.3 Create Project Empty Name

```bash
curl -i -X POST "$API/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "",
    "description": "Invalid"
  }'
```

Expected:

```txt
422 or 400 validation error
```

## 8.4 Create Task Without Assignee

```bash
curl -i -X POST "$API/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "No assignee",
    "projectId": "some_project_id"
  }'
```

Expected:

```txt
422 Unprocessable Entity
```

## 8.5 Create Task With Non-Member Assignee

If you have a user who is not added to the project, try assigning them.

Expected:

```json
{
  "detail": "Assignee must be a member of the project"
}
```

## 9. Railway Testing

## 9.1 Check Services

```bash
npx @railway/cli service status --service backend
npx @railway/cli service status --service frontend
```

Expected:

```txt
Status: SUCCESS
```

## 9.2 Check Backend Logs

```bash
npx @railway/cli logs --service backend
```

Expected:

```txt
Uvicorn running
Application startup complete
```

## 9.3 Check Frontend Logs

```bash
npx @railway/cli logs --service frontend
```

Expected:

```txt
vite preview running
Local: http://localhost:8080/
```

## 9.4 Check Variables

Backend:

```bash
npx @railway/cli variable list --service backend
```

Expected variables:

```txt
DATABASE_URL
JWT_SECRET
CORS_ORIGINS
```

Frontend:

```bash
npx @railway/cli variable list --service frontend
```

Expected:

```txt
VITE_API_URL
```

## 10. Final Acceptance Checklist

Use this final checklist before submission.

```txt
[ ] FastAPI backend starts successfully
[ ] SQLAlchemy connects to the configured database
[ ] PostgreSQL DATABASE_URL works in production
[ ] SQLAlchemy creates required tables on startup
[ ] Frontend live URL opens
[ ] Backend /health returns {"status":"ok"}
[ ] User can signup
[ ] User can login
[ ] Invalid login fails
[ ] Admin can create project
[ ] Admin can edit project
[ ] Admin can delete project
[ ] Admin can add member to project
[ ] Admin can create task
[ ] Admin can assign task to member
[ ] Admin can update task status
[ ] Admin can delete task
[ ] Member can view assigned projects only
[ ] Member can view assigned tasks only
[ ] Member can update assigned task status
[ ] Member cannot create project
[ ] Member cannot create task
[ ] Member cannot delete task
[ ] Member cannot update task title/assignee/project
[ ] Dashboard shows total tasks
[ ] Dashboard shows todo tasks
[ ] Dashboard shows in-progress tasks
[ ] Dashboard shows completed tasks
[ ] Dashboard shows overdue tasks
[ ] API without JWT returns 401
[ ] Member calling admin API returns 403
[ ] Railway backend service status is SUCCESS
[ ] Railway frontend service status is SUCCESS
[ ] Railway PostgreSQL service status is SUCCESS
[ ] Railway Postgres contains users table
[ ] Railway Postgres contains projects table
[ ] Railway Postgres contains project_members table
[ ] Railway Postgres contains tasks table
[ ] README has setup instructions
[ ] README has API endpoints
[ ] README has role explanation
[ ] README has Railway deployment notes
[ ] README has live URL
[ ] README has backend URL
[ ] README has demo credentials
[ ] GitHub repo URL is added
[ ] Demo video URL is added
```

## 11. What to Show in Demo Video

Recommended 2-5 minute demo:

1. Open live frontend URL.
2. Login as Admin.
3. Show dashboard.
4. Create project.
5. Add member to project.
6. Create task assigned to member.
7. Show task in task list.
8. Logout.
9. Login as Member.
10. Show member can see assigned project.
11. Show member can see assigned task.
12. Update task status as member.
13. Show dashboard count changed.
14. Mention backend health URL.
15. Mention Railway deployment.

## 12. Troubleshooting

### Frontend Shows Blank Page

Check:

```bash
npx @railway/cli logs --service frontend
```

Also check:

```txt
VITE_API_URL is set correctly.
```

### Login Fails

Check backend:

```bash
curl https://backend-production-f6a9.up.railway.app/health
```

Check database:

```bash
npx @railway/cli connect Postgres
```

Then:

```sql
SELECT email, role FROM users;
```

### API Returns 401

Meaning:

```txt
Missing token or invalid/expired token.
```

Fix:

```txt
Login again and use new token.
```

### API Returns 403

Meaning:

```txt
Logged-in user does not have permission.
```

Example:

```txt
Member trying to create project.
```

### API Returns 404

Possible reasons:

```txt
Wrong endpoint
Missing /api prefix
Project/task ID does not exist
Opening backend root /
```

### API Returns 422

Meaning:

```txt
Payload validation failed.
Required field missing or wrong type.
```

Check JSON body and schema.

### Member Does Not See Project

Reason:

```txt
Member was not added to project.
```

Admin must add member from project details page.

### Member Does Not Appear in Task Assignee Dropdown

Reason:

```txt
Member is not part of selected project.
```

Add member to that project first.

### Overdue Count Not Showing

Overdue means:

```txt
dueDate is before current time
and status is not DONE
```

To test overdue:

1. Create task with past due date.
2. Keep status as `TODO` or `IN_PROGRESS`.
3. Dashboard overdue count should increase.

## 13. Final Result Meaning

If all tests pass:

```txt
The app satisfies the assignment requirements.
```

If only GitHub/demo video are missing:

```txt
The app is technically complete but submission is incomplete.
```

Final required submission items:

```txt
Live URL
GitHub repo
README
2-5 min demo video
```

## 14. Exact Quick Reverification Commands

Use this section when you want to quickly confirm that everything still works.

## 14.0 Single-Run Verification Script

A full verification script is available at:

```txt
scripts/verify_all.sh
```

Run:

```bash
./scripts/verify_all.sh
```

What it checks:

```txt
Required commands
Live frontend URL
Live backend health
Expected backend root 404
Frontend build
Frontend lint
Backend Python compile
Demo Admin login
Demo Member login
Full live API auth/RBAC/project/task/dashboard flow
Documentation files
README submission fields
GitHub remote
Screenshot warning
Railway CLI status if authenticated
```

Logs are written to:

```txt
verification-logs/<timestamp>/
```

If any check fails, the script prints the exact log file path for that failure.

Important:

```txt
If live URL checks fail with "Could not resolve host", it usually means network/DNS access is blocked in the current terminal environment.
Run it again from a normal terminal with internet access.
```

Current expected non-technical failures before final submission:

```txt
README GitHub Repo is empty
README Demo Video is empty
No git remote is configured
```

## 14.1 Live Frontend Check

```bash
curl -s -o /tmp/frontend_check.txt -w '%{http_code}' https://frontend-production-d08f.up.railway.app
```

Expected:

```txt
200
```

## 14.2 Live Backend Check

```bash
curl -s -i https://backend-production-f6a9.up.railway.app/health
```

Expected:

```txt
HTTP/2 200
```

Expected body:

```json
{"status":"ok"}
```

## 14.3 Local Build and Lint Check

Frontend:

```bash
cd frontend
npm run build
npm run lint
```

Expected:

```txt
Build succeeds.
ESLint shows no errors.
```

Backend:

```bash
cd /Users/sajjan/team-task-manager
python3 -m compileall backend/app backend/main.py
```

Expected:

```txt
No Python compile errors.
```

## 14.4 Fast Live API Acceptance Script

This creates fresh temporary users/project/task and checks the important backend rules.

```bash
API=https://backend-production-f6a9.up.railway.app/api
STAMP=$(date +%s)
ADMIN_EMAIL="verify-admin-$STAMP@example.com"
MEMBER_EMAIL="verify-member-$STAMP@example.com"
PASSWORD="password123"

ADMIN_SIGNUP=$(curl -s -X POST "$API/auth/signup" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Verify Admin\",\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"ADMIN\"}")

MEMBER_SIGNUP=$(curl -s -X POST "$API/auth/signup" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Verify Member\",\"email\":\"$MEMBER_EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"MEMBER\"}")

ADMIN_TOKEN=$(printf '%s' "$ADMIN_SIGNUP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')
MEMBER_TOKEN=$(printf '%s' "$MEMBER_SIGNUP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')
MEMBER_ID=$(printf '%s' "$MEMBER_SIGNUP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["user"]["id"])')

echo "unauth dashboard should be 401:"
curl -s -o /tmp/verify_unauth.json -w '%{http_code}\n' "$API/dashboard"

echo "member create project should be 403:"
curl -s -o /tmp/verify_member_create_project.json -w '%{http_code}\n' \
  -X POST "$API/projects" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{"name":"Should Fail","description":"Member RBAC check"}'

PROJECT=$(curl -s -X POST "$API/projects" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"name\":\"Verify Project $STAMP\",\"description\":\"Live verification project\"}")

PROJECT_ID=$(printf '%s' "$PROJECT" | python3 -c 'import sys,json; print(json.load(sys.stdin)["project"]["id"])')

echo "add member should be 201:"
curl -s -o /tmp/verify_add_member.json -w '%{http_code}\n' \
  -X POST "$API/projects/$PROJECT_ID/members" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"email\":\"$MEMBER_EMAIL\"}"

TASK=$(curl -s -X POST "$API/tasks" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"title\":\"Verify Task $STAMP\",\"description\":\"Live verification task\",\"status\":\"TODO\",\"priority\":\"HIGH\",\"dueDate\":null,\"projectId\":\"$PROJECT_ID\",\"assigneeId\":\"$MEMBER_ID\"}")

TASK_ID=$(printf '%s' "$TASK" | python3 -c 'import sys,json; print(json.load(sys.stdin)["task"]["id"])')

echo "member projects should be 200:"
curl -s -o /tmp/verify_member_projects.json -w '%{http_code}\n' \
  "$API/projects" \
  -H "Authorization: Bearer $MEMBER_TOKEN"

echo "member tasks should be 200:"
curl -s -o /tmp/verify_member_tasks.json -w '%{http_code}\n' \
  "$API/tasks" \
  -H "Authorization: Bearer $MEMBER_TOKEN"

echo "member status update should be 200:"
curl -s -o /tmp/verify_member_update.json -w '%{http_code}\n' \
  -X PUT "$API/tasks/$TASK_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{"status":"IN_PROGRESS"}'

echo "member forbidden field update should be 403:"
curl -s -o /tmp/verify_member_update_forbidden.json -w '%{http_code}\n' \
  -X PUT "$API/tasks/$TASK_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{"title":"Forbidden title","status":"DONE"}'

echo "admin dashboard should be 200:"
curl -s -o /tmp/verify_dashboard.json -w '%{http_code}\n' \
  "$API/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

cat /tmp/verify_dashboard.json
```

Expected status sequence:

```txt
401
403
201
200
200
200
403
200
```

Exact dashboard numbers can change because test data grows over time.

## 15. Railway CLI Auth Expired

Sometimes Railway CLI commands fail with:

```txt
Unauthorized. Please run `railway login` again.
```

or:

```txt
failed to refresh OAuth token
```

This does not mean the deployed app is down.

It only means your local Railway CLI session expired.

Fix:

```bash
npx @railway/cli login --browserless
```

Then open:

```txt
https://railway.com/activate
```

Enter the code shown in terminal.

After login, recheck:

```bash
npx @railway/cli whoami
npx @railway/cli service status --service backend
npx @railway/cli service status --service frontend
```

Expected:

```txt
Logged in as ...
Status: SUCCESS
```

## 16. GitHub and Submission Readiness Testing

The app can work technically but still be incomplete for submission if GitHub or video links are missing.

## 16.1 Check Git Remote

```bash
git remote -v
```

Expected before final submission:

```txt
origin  https://github.com/<your-username>/<repo-name>.git (fetch)
origin  https://github.com/<your-username>/<repo-name>.git (push)
```

If output is empty:

```txt
No GitHub remote is connected yet.
```

## 16.2 Check Git Status

```bash
git status --short
```

Review:

```txt
Modified files
Deleted files
Untracked files
Screenshot files
Documentation files
```

Before pushing, decide whether screenshot files should be included.

Screenshot files are usually not needed unless you intentionally want them in the repo.

## 16.3 Check README Submission Fields

```bash
rg -n "Live URL|Backend URL|GitHub Repo|Demo Video|Demo Admin|Demo Member" README.md
```

Before final submission:

```txt
Live URL should be filled.
Backend URL should be filled.
GitHub Repo should be filled.
Demo Video should be filled.
Demo Admin Credentials should be filled.
Demo Member Credentials should be filled.
```

Currently, if these are blank:

```txt
GitHub Repo:
Demo Video:
```

then submission is not complete yet.

## 16.4 Check Required Documentation Files

Useful files created for this project:

```txt
README.md
whole_process.md
testing.md
Script.md
```

Check they exist:

```bash
ls README.md whole_process.md testing.md Script.md
```

## 16.5 Final Submission State

Technically complete means:

```txt
Live frontend works.
Live backend works.
Database stores data.
Auth/RBAC works.
Dashboard works.
README explains setup/APIs/roles/deployment.
```

Submission complete means:

```txt
Everything above plus:
GitHub repo pushed.
README has GitHub URL.
Demo video recorded.
README has demo video URL.
```
