# Team Task Manager - Demo Video Script

Target video length: 4 to 5 minutes

Live frontend:

```txt
https://frontend-production-d08f.up.railway.app
```

Backend health:

```txt
https://backend-production-f6a9.up.railway.app/health
```

Demo Admin:

```txt
admin@demo.com
password123
```

Demo Member:

```txt
member@demo.com
password123
```

## Before Recording

Prepare these browser tabs:

1. Frontend app:

```txt
https://frontend-production-d08f.up.railway.app
```

2. Backend health check:

```txt
https://backend-production-f6a9.up.railway.app/health
```

3. GitHub repository tab, if already pushed.

Optional:

4. Railway project dashboard.

Recommended test data names:

```txt
Project name: Demo Video Project
Project description: Project created during demo recording
Task title: Prepare sprint report
Task description: Complete the assigned sprint report and update status
Priority: HIGH
Status: TODO
Assignee: Demo Member
```

## 5-Minute Demo Script

## 0:00 - 0:20 Introduction

Say:

```txt
Hi, this is my Team Task Manager full-stack assignment.

This application allows users to create projects, add team members, assign tasks, and track task progress with role-based access for Admin and Member users.

The app is deployed live on Railway.
```

Show:

- Open frontend URL.
- Mention that this is the live deployed app.

## 0:20 - 0:45 Tech Stack and Deployment

Say:

```txt
The frontend is built with React, Vite, Tailwind CSS, React Router, and Axios.

The backend is built with Python FastAPI, SQLAlchemy, PostgreSQL, JWT authentication, and passlib bcrypt for password hashing.

The backend, frontend, and PostgreSQL database are all deployed on Railway.
```

Show:

- Frontend tab.
- Backend health tab.

Open:

```txt
https://backend-production-f6a9.up.railway.app/health
```

Say:

```txt
This health endpoint confirms that the backend API is running.
```

Expected screen:

```json
{"status":"ok"}
```

## 0:45 - 1:15 Login as Admin

Show:

- Go to frontend app.
- Login page.

Say:

```txt
First, I will login as an Admin user.

Admin users can manage projects, add members, create and assign tasks, update tasks, delete tasks, and view all dashboard data.
```

Enter:

```txt
Email: admin@demo.com
Password: password123
```

Click:

```txt
Log in
```

Expected:

- Dashboard opens.

Say:

```txt
After login, the app stores a JWT token in the browser and sends it with protected API requests.
```

## 1:15 - 1:45 Admin Dashboard

Show:

- Dashboard cards.

Say:

```txt
This is the dashboard.

It shows total tasks, todo tasks, in-progress tasks, completed tasks, overdue tasks, and total projects.

For Admin, these counts are calculated across all projects and tasks.
```

Mention:

```txt
The dashboard data comes from the protected GET /api/dashboard endpoint.
```

## 1:45 - 2:15 Create Project

Show:

- Click `Projects`.
- Click `Create project`.

Say:

```txt
Now I will create a new project as Admin.
```

Enter:

```txt
Name: Demo Video Project
Description: Project created during demo recording
```

Click submit.

Expected:

- Project appears in list.

Say:

```txt
This creates a project record in PostgreSQL.

The backend automatically stores the current Admin user as the project owner.
```

Mention endpoint:

```txt
This uses POST /api/projects.
```

## 2:15 - 2:45 Add Member to Project

Show:

- Open project details.
- Find Add member form.

Say:

```txt
Now I will add a team member to this project.

Only Admin can add members.
```

Enter:

```txt
member@demo.com
```

Click:

```txt
Add
```

Expected:

- Demo Member appears in Members list.

Say:

```txt
This creates a relationship between the project and the user in the project_members table.

This relationship is important because tasks can only be assigned to members of that project.
```

Mention endpoint:

```txt
This uses POST /api/projects/{project_id}/members.
```

## 2:45 - 3:25 Create and Assign Task

Show:

- Click `Tasks`.
- Click `Create task`.

Say:

```txt
Now I will create a task and assign it to the team member.
```

Enter:

```txt
Title: Prepare sprint report
Description: Complete the assigned sprint report and update status
Project: Demo Video Project
Assignee: Demo Member
Status: TODO
Priority: HIGH
Due date: choose a future date
```

Click submit.

Expected:

- Task appears in task list.

Say:

```txt
The task is linked to a project, assigned to a member, and created by the Admin.

The backend validates that the assignee is already a member of the selected project before creating the task.
```

Mention endpoint:

```txt
This uses POST /api/tasks.
```

## 3:25 - 3:45 Logout and Login as Member

Show:

- Click logout.
- Login as member.

Say:

```txt
Now I will logout and login as the Member user.

Member users have limited access. They can only view their assigned projects and tasks, and they can update only the status of their assigned tasks.
```

Enter:

```txt
Email: member@demo.com
Password: password123
```

Click:

```txt
Log in
```

## 3:45 - 4:15 Member View and Restrictions

Show:

- Open Projects.

Say:

```txt
As a Member, I can see only the projects where I have been added as a member.

Notice that the Member does not get project creation or delete controls.
```

Show:

- Open Tasks.

Say:

```txt
On the Tasks page, the Member can see only tasks assigned to them.

The Member cannot create or delete tasks.
```

## 4:15 - 4:35 Member Updates Task Status

Show:

- Change task status from `TODO` to `IN_PROGRESS` or `DONE`.

Say:

```txt
Now I will update the assigned task status as Member.

This is allowed, but the Member cannot edit task title, project, assignee, priority, or due date.
```

Expected:

- Status updates.

Mention endpoint:

```txt
This uses PUT /api/tasks/{task_id} with only the status field.
```

## 4:35 - 4:50 Dashboard Updated

Show:

- Go to Dashboard as Member.
- Optionally logout and login as Admin again.

Say:

```txt
After the status update, the dashboard reflects the updated task progress.

The overdue count is calculated for tasks whose due date has passed and whose status is not DONE.
```

## 4:50 - 5:00 Closing

Say:

```txt
This project includes authentication, JWT-protected REST APIs, PostgreSQL database relationships, validations, role-based access control, project and team management, task assignment, dashboard tracking, and Railway deployment.

Thank you.
```

## Shorter 2-Minute Version

Use this if you need a shorter recording.

Say:

```txt
Hi, this is my Team Task Manager full-stack assignment.

It is built with React, Vite, Tailwind CSS, FastAPI, SQLAlchemy, PostgreSQL, JWT authentication, and deployed on Railway.

I will first login as Admin.

On the dashboard, Admin can see total tasks, todo tasks, in-progress tasks, completed tasks, overdue tasks, and total projects.

Now I will create a project.

After creating the project, I will add a team member by email.

Now I will create a task, assign it to the member, set priority, due date, and status.

Next, I will logout and login as Member.

The Member can only see assigned projects and assigned tasks.

The Member cannot create or delete projects or tasks.

The Member can update only the assigned task status.

Now I will update the task status.

The dashboard updates based on task progress.

The backend APIs are protected with JWT, Admin-only APIs are blocked for Members, and all data is stored in Railway PostgreSQL.

The app is live on Railway and fully functional.

Thank you.
```

## What Not to Say

Do not say:

```txt
the old JavaScript backend stack
```

This project currently uses:

```txt
FastAPI
SQLAlchemy
PostgreSQL
React
Vite
Railway
```

## Demo Checklist While Recording

```txt
[ ] Show live frontend URL
[ ] Show backend health URL
[ ] Login as Admin
[ ] Show dashboard
[ ] Create project
[ ] Add member
[ ] Create task
[ ] Logout
[ ] Login as Member
[ ] Show assigned project
[ ] Show assigned task
[ ] Update task status
[ ] Mention JWT protection
[ ] Mention RBAC
[ ] Mention PostgreSQL relationships
[ ] Mention Railway deployment
```

## Backup Lines If Something Is Already Created

If project already exists:

```txt
I already have a demo project created, so I will open its details and continue by adding a member and creating a task.
```

If member already exists in project:

```txt
The member is already added to this project, so I will continue to task assignment.
```

If task already exists:

```txt
There is already an assigned task here, so I will use it to demonstrate the Member status update flow.
```

If duplicate email appears during signup:

```txt
This validation shows that duplicate emails are blocked. I will continue using the existing demo credentials.
```
