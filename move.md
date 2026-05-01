# Move Project to Windows Laptop and Keep Everything Working

This guide explains how to move this project from the current machine to your own Windows laptop, run it locally, keep the Railway deployment working, and then push it to GitHub.

Current project folder on this machine:

```txt
/Users/sajjan/team-task-manager
```

Recommended Windows folder:

```txt
C:\Users\<your-name>\Documents\team-task-manager
```

or:

```txt
D:\projects\team-task-manager
```

## 1. What This Project Contains

Main folders/files:

```txt
team-task-manager/
├── backend/
├── frontend/
├── scripts/
├── README.md
├── whole_process.md
├── testing.md
├── Script.md
├── description.md
├── requirements.md
└── move.md
```

Important live URLs:

```txt
Frontend: https://frontend-production-d08f.up.railway.app
Backend:  https://backend-production-f6a9.up.railway.app
Health:   https://backend-production-f6a9.up.railway.app/health
```

## 2. What to Copy to Windows

Copy the whole project folder:

```txt
team-task-manager
```

Make sure these are included:

```txt
backend/
frontend/
scripts/
README.md
whole_process.md
testing.md
Script.md
description.md
requirements.md
move.md
.gitignore
```

## 3. What Not to Copy or Commit

Do not intentionally copy or commit generated/dependency folders:

```txt
frontend/node_modules/
frontend/dist/
backend/.venv/
backend/venv/
backend/__pycache__/
backend/app/__pycache__/
verification-logs/
*.pyc
.env
```

These are either regenerated or contain local secrets/config.

Screenshot files are optional:

```txt
Screenshot 2026-05-01 at 1.46.22 PM.png
Screenshot 2026-05-01 at 2.08.54 PM.png
```

Usually, do not push screenshots unless you need them in the repo.

## 4. Best Way to Transfer

Recommended:

1. Compress the folder as zip.
2. Move zip to Windows laptop using USB, Drive, or any transfer method.
3. Extract it on Windows.
4. Open extracted folder in VS Code.

On macOS/current machine:

```bash
cd /Users/sajjan
zip -r team-task-manager.zip team-task-manager \
  -x "team-task-manager/frontend/node_modules/*" \
  -x "team-task-manager/frontend/dist/*" \
  -x "team-task-manager/backend/.venv/*" \
  -x "team-task-manager/verification-logs/*" \
  -x "team-task-manager/.env" \
  -x "team-task-manager/backend/.env" \
  -x "team-task-manager/frontend/.env"
```

Then move:

```txt
team-task-manager.zip
```

to Windows and extract it.

## 5. Required Software on Windows

Install these on Windows:

### 5.1 Git

Download:

```txt
https://git-scm.com/download/win
```

Check:

```powershell
git --version
```

### 5.2 Node.js

Install LTS version:

```txt
https://nodejs.org
```

Check:

```powershell
node --version
npm --version
```

### 5.3 Python

Install Python 3.10+:

```txt
https://www.python.org/downloads/windows/
```

Important:

During install, select:

```txt
Add python.exe to PATH
```

Check:

```powershell
python --version
pip --version
```

If `python` does not work, try:

```powershell
py --version
```

### 5.4 VS Code

Download:

```txt
https://code.visualstudio.com/
```

Useful extensions:

```txt
Python
ESLint
Prettier
PostgreSQL / Database Client extension
```

### 5.5 Railway CLI

No global install is required. Use:

```powershell
npx @railway/cli --version
```

If it asks to install, type:

```txt
y
```

## 6. Open Project on Windows

Open PowerShell.

Go to project:

```powershell
cd "C:\Users\<your-name>\Documents\team-task-manager"
```

Open in VS Code:

```powershell
code .
```

If `code` command does not work:

1. Open VS Code manually.
2. File -> Open Folder.
3. Select `team-task-manager`.

## 7. Recreate Environment Files on Windows

`.env` files are not committed.

Create them again from examples.

### 7.1 Backend `.env`

PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
```

Open:

```txt
backend\.env
```

For local SQLite testing, use:

```env
DATABASE_URL="sqlite:///./team_task_manager.db"
JWT_SECRET="local_windows_dev_secret_change_me"
CORS_ORIGINS="http://localhost:5173"
PORT=8000
```

### 7.2 Frontend `.env`

PowerShell:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Open:

```txt
frontend\.env
```

Use:

```env
VITE_API_URL=http://localhost:8000/api
```

Meaning:

```txt
Local frontend will call local backend.
```

## 8. Run Backend Locally on Windows

PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

If activation is blocked, run PowerShell as current user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then activate again:

```powershell
.\.venv\Scripts\Activate.ps1
```

Backend should run at:

```txt
http://localhost:8000
```

Test:

```powershell
curl http://localhost:8000/health
```

Expected:

```json
{"status":"ok"}
```

If PowerShell `curl` behaves strangely, use:

```powershell
curl.exe http://localhost:8000/health
```

## 9. Run Frontend Locally on Windows

Open a second PowerShell terminal.

```powershell
cd frontend
npm install
npm run dev
```

Frontend should run at:

```txt
http://localhost:5173
```

Open in browser:

```txt
http://localhost:5173
```

## 10. Local Test Flow on Windows

With backend and frontend both running:

1. Open `http://localhost:5173`.
2. Sign up as Admin.
3. Sign up as Member.
4. Login as Admin.
5. Create project.
6. Add Member to project.
7. Create task assigned to Member.
8. Logout.
9. Login as Member.
10. View assigned project/task.
11. Update task status.
12. Check dashboard.

Local data will be stored in:

```txt
backend/team_task_manager.db
```

because local backend uses SQLite.

## 11. Test Live Deployment From Windows

Even from Windows, the deployed Railway app should work without running local servers.

Open:

```txt
https://frontend-production-d08f.up.railway.app
```

Check backend:

```powershell
curl.exe https://backend-production-f6a9.up.railway.app/health
```

Expected:

```json
{"status":"ok"}
```

## 12. Run Verification Script on Windows

The script is Bash:

```txt
scripts/verify_all.sh
```

Best way on Windows:

Use Git Bash, which comes with Git for Windows.

Open:

```txt
Git Bash
```

Go to project:

```bash
cd /c/Users/<your-name>/Documents/team-task-manager
```

Run:

```bash
./scripts/verify_all.sh
```

Expected:

```txt
Most technical checks should pass.
```

Known expected failures before final submission:

```txt
GitHub Repo field empty
Demo Video field empty
No GitHub remote configured
```

Logs are saved in:

```txt
verification-logs/<timestamp>/
```

Do not commit `verification-logs/`.

## 13. Railway CLI on Windows

If you need to manage Railway from Windows:

```powershell
npx @railway/cli login --browserless
```

Railway will show:

```txt
activation code
https://railway.com/activate
```

Open the URL, enter the code, and login.

Check:

```powershell
npx @railway/cli whoami
```

Check services:

```powershell
npx @railway/cli service status --service backend
npx @railway/cli service status --service frontend
```

If you see:

```txt
Unauthorized. Please run railway login again.
```

then login again.

The deployed app can still work even if local Railway CLI auth is expired.

## 14. View Railway Postgres From Windows

Use Railway CLI:

```powershell
npx @railway/cli connect Postgres
```

If connected, run:

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

View users:

```sql
SELECT id, name, email, role, created_at FROM users;
```

View tasks:

```sql
SELECT title, status, priority, project_id, assignee_id, created_by_id FROM tasks;
```

Exit:

```sql
\q
```

Important:

```txt
127.0.0.1:5432 is local Windows Postgres, not Railway Postgres.
```

The live deployed app uses Railway Postgres.

## 15. Prepare GitHub Repo From Windows

After project works locally, push to GitHub.

### 15.1 Check Git Status

```powershell
git status --short
```

Review files carefully.

Do not commit:

```txt
node_modules/
dist/
.venv/
.env
verification-logs/
local database files
unwanted screenshots
```

### 15.2 Remove Unwanted Screenshot Files

If you do not want screenshots in GitHub:

PowerShell:

```powershell
Remove-Item "Screenshot 2026-05-01 at 1.46.22*"
Remove-Item "Screenshot 2026-05-01 at 2.08.54*"
```

Only do this if you are sure they are not needed.

### 15.3 Create GitHub Repository

On GitHub:

1. Create new repository.
2. Name it:

```txt
team-task-manager
```

3. Do not add README from GitHub UI if your local repo already has README.

### 15.4 Add Remote

Use your actual GitHub URL:

```powershell
git remote add origin https://github.com/<your-username>/team-task-manager.git
```

Check:

```powershell
git remote -v
```

Expected:

```txt
origin  https://github.com/<your-username>/team-task-manager.git (fetch)
origin  https://github.com/<your-username>/team-task-manager.git (push)
```

### 15.5 Commit and Push

```powershell
git add .
git commit -m "Complete team task manager assignment"
git branch -M main
git push -u origin main
```

If Git asks for login:

```txt
Use GitHub browser login or personal access token.
```

## 16. Update README After GitHub and Video

Open:

```txt
README.md
```

Update:

```txt
GitHub Repo:
Demo Video:
```

Example:

```txt
GitHub Repo: https://github.com/<your-username>/team-task-manager
Demo Video: https://drive.google.com/file/d/<video-id>/view
```

Then commit again:

```powershell
git add README.md
git commit -m "Add submission links"
git push
```

## 17. Windows Common Problems

### 17.1 Python Command Not Found

Try:

```powershell
py --version
py -m venv .venv
```

instead of:

```powershell
python
```

### 17.2 PowerShell Script Activation Blocked

Run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 17.3 curl Is Different in PowerShell

Use:

```powershell
curl.exe
```

instead of:

```powershell
curl
```

### 17.4 Port Already in Use

If backend port `8000` is busy:

```powershell
uvicorn main:app --reload --port 8001
```

Then update frontend `.env`:

```env
VITE_API_URL=http://localhost:8001/api
```

Restart frontend after changing `.env`.

If frontend port `5173` is busy, Vite may choose another port.

Use the URL printed by terminal.

### 17.5 npm install Fails

Try:

```powershell
npm cache clean --force
npm install
```

Make sure Node.js LTS is installed.

### 17.6 Backend Cannot Import Packages

Make sure virtual environment is active:

```powershell
.\.venv\Scripts\Activate.ps1
```

Then:

```powershell
pip install -r requirements.txt
```

### 17.7 Frontend Calls Wrong Backend

Check:

```txt
frontend\.env
```

Local:

```env
VITE_API_URL=http://localhost:8000/api
```

Production:

```env
VITE_API_URL=https://backend-production-f6a9.up.railway.app/api
```

After changing `.env`, restart frontend:

```powershell
npm run dev
```

## 18. Final Windows Checklist

Use this after moving project:

```txt
[ ] Project folder copied to Windows
[ ] Git installed
[ ] Node.js installed
[ ] Python installed
[ ] VS Code installed
[ ] backend\.env created
[ ] frontend\.env created
[ ] Backend dependencies installed
[ ] Frontend dependencies installed
[ ] Backend runs locally
[ ] Frontend runs locally
[ ] Local signup/login works
[ ] Local Admin project flow works
[ ] Local Member task status update works
[ ] Live Railway frontend still opens
[ ] Live Railway backend health works
[ ] Verification script runs in Git Bash
[ ] Unwanted screenshots removed or intentionally kept
[ ] GitHub repo created
[ ] Git remote added
[ ] Code pushed to GitHub
[ ] README GitHub URL updated
[ ] Demo video recorded
[ ] README demo video URL updated
```

## 19. Most Important Notes

Do not commit `.env` files.

Do not commit `node_modules`.

Do not commit `.venv`.

The live Railway app will continue working after moving the folder because it is already deployed online.

Your Windows laptop is needed for:

```txt
local development
GitHub push
demo recording
future changes
```

If you make changes on Windows and want Railway to update, you can redeploy from Windows using Railway CLI after logging in.
